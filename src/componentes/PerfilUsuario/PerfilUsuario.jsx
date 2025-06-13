import React, { useState, useEffect } from 'react';
import Calendario from './Calendario.jsx';
import Boton from '../Formularios/boton.jsx';
import Etiqueta from '../Formularios/etiquetas.jsx';
import PopupConfirmacion from './popUp.jsx';
import PopupReprogramacion from './popUpReprogramacion.jsx';
import '../../styles/PerfilUsuario.css';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const PerfilUsuario = () => {
  const { user, loading: loadingAuth } = useAuth();
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [mostrarReprogramacion, setMostrarReprogramacion] = useState(false);
  const [datosUsuario, setDatosUsuario] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: ''
  });
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [editando, setEditando] = useState(false);
  const [fechasConTurno, setFechasConTurno] = useState([]);
  const [loadingTurnos, setLoadingTurnos] = useState(false);
  const [loadingUserData, setLoadingUserData] = useState(false);
  const [errorTurnos, setErrorTurnos] = useState(null);
  const [errorUserData, setErrorUserData] = useState(null);
  const [cancelando, setCancelando] = useState(false);
  const [reprogramando, setReprogramando] = useState(false);
  const [multiplesTurnos, setMultiplesTurnos] = useState([]);
  const [mostrarSeleccionTurnos, setMostrarSeleccionTurnos] = useState(false);

  useEffect(() => {
    if (loadingAuth) return;  // todavía estamos cargando el contexto
    
    console.log("Estado del contexto auth:", { user, loadingAuth });
    
    if (!user) {
      console.log("No hay usuario en el contexto");
      setFechasConTurno([]);
      return setErrorTurnos('Por favor, inicia sesión para ver tus turnos');
    }
    
    if (!user.id_cliente) {
      console.log("Usuario sin ID de cliente:", user);
      setFechasConTurno([]);
      return setErrorTurnos('No se encontró ID de cliente');
    }
  
    // Hay usuario con ID: traemos sus turnos
    console.log("Cargando turnos para el cliente ID:", user.id_cliente);
    cargarTurnos();
    // Y cargamos sus datos completos
    cargarDatosUsuario();
  }, [loadingAuth, user]);

  // Función para cargar los turnos del usuario
  const cargarTurnos = () => {
    if (!user || !user.id_cliente) return;
    
    setLoadingTurnos(true);
    setErrorTurnos(null);
  
    const endpoint = `https://spabackend-production-e093.up.railway.app/api/turnos/${user.id_cliente}`;
    console.log("Consultando turnos en:", endpoint);
  
    axios.get(endpoint)
      .then(res => {
        console.log("Turnos recibidos:", res.data);
        
        // Filtrar para mostrar solo los turnos no cancelados
        const turnosActivos = res.data.filter(turno => turno.estado !== 'Cancelado');
        console.log("Turnos activos filtrados:", turnosActivos);
        
        // Aquí procesamos las fechas para el calendario
        const turnosProcesados = turnosActivos.map(turno => {
          // Creamos una copia para no mutar el objeto original
          const turnoProcesado = {...turno};
          
          // Guardamos también la fecha/hora ajustada como propiedad adicional para el calendario
          const { fecha } = ajustarZonaHoraria(turno.fecha_hora);
          turnoProcesado.fechaAjustada = fecha;
          
          return turnoProcesado;
        });
        
        console.log("Turnos procesados con fecha ajustada:", turnosProcesados);
        setFechasConTurno(turnosProcesados);
      })
      .catch(err => {
        console.error('Error al cargar turnos:', err);
        console.error('Detalles del error:', err.response?.data || 'No hay detalles adicionales');
        setErrorTurnos('No se pudieron cargar los turnos: ' + (err.response?.data?.error || err.message));
      })
      .finally(() => {
        setLoadingTurnos(false);
      });
  };
  
  //funcion para corregir zona horaria en el read
  const ajustarZonaHoraria = (fechaHoraString) => {
    if (!fechaHoraString) return { fecha: '', hora: '' };
    
    // Crear un objeto Date a partir del string de fecha y hora
    const fecha = new Date(fechaHoraString);
    
    
    // Formatear localmente -- Esto me dejo ciego -- firma el principe mestizo
    const fechaAjustada = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
    const horaAjustada = `${String(fecha.getHours()).padStart(2, '0')}:${String(fecha.getMinutes()).padStart(2, '0')}`;
    
    return { fecha: fechaAjustada, hora: horaAjustada };
  };

  // Nueva función para cargar los datos completos del usuario
  const cargarDatosUsuario = () => {
    if (!user || !user.id_cliente) return;
    
    setLoadingUserData(true);
    setErrorUserData(null);
  
    const endpoint = `https://spabackend-production-e093.up.railway.app/api/clientes/${user.id_cliente}`;
    console.log("Consultando API en:", endpoint);
  
    axios.get(endpoint)
      .then(res => {
        console.log("Datos del usuario recibidos:", res.data);
        setDatosUsuario({
          nombre: res.data.nombre || '',
          apellido: res.data.apellido || '',
          email: res.data.email || '',
          telefono: res.data.telefono || '',
          direccion: res.data.direccion || ''
        });
      })
      .catch(err => {
        console.error('Error al cargar datos del usuario:', err);
        console.error('Detalles del error:', err.response?.data || 'No hay detalles adicionales');
        setErrorUserData('No se pudieron cargar los datos del usuario: ' + (err.response?.data?.error || err.message));
        
        // Si fallamos, al menos intentamos usar lo que teníamos del contexto auth
        if (user && user.nombre) {
          setDatosUsuario(prev => ({
            ...prev,
            nombre: user.nombre
          }));
        }
      })
      .finally(() => {
        setLoadingUserData(false);
      });
  };

  // Handlers
  const handleDateChange = date => setFechaSeleccionada(date);
  const handleTurnoClick = (fecha) => {
    // Encontrar todos los turnos para la fecha seleccionada
    // Necesitamos comparar con las fechas ajustadas
    const turnosDelDia = fechasConTurno.filter(t => {
      const { fecha: fechaAjustada } = ajustarZonaHoraria(t.fecha_hora);
      return fechaAjustada === fecha;
    });
    
    if (turnosDelDia.length > 0) {
      if (turnosDelDia.length === 1) {
        // Si hay un solo turno, mostrarlo directamente
        setTurnoSeleccionado(turnosDelDia[0]);
      } else {
        // Si hay múltiples turnos, mostrar popup de selección
        setMultiplesTurnos(turnosDelDia);
        setMostrarSeleccionTurnos(true);
      }
    }
  };
  const SeleccionTurnosPopup = ({ turnos, onSeleccionar, onCancelar }) => {
    return (
      <div className="modal-turno">
        <div className="modal-contenido">
          <h3>Múltiples turnos en esta fecha.</h3>
          <p>Selecciona el turno que deseas ver:</p>
          
          <div className="lista-turnos">
            {turnos.map((turno) => {
              const { hora } = ajustarZonaHoraria(turno.fecha_hora);
              
              return (
                <div 
                  key={turno.id_turno} 
                  className="item-turno"
                  onClick={() => onSeleccionar(turno)}
                >
                  <p><strong>Hora:</strong> {hora}</p>
                  <p><strong>Servicio:</strong> {turno.nombre_servicio || 'N/A'}</p>
                  <p><strong>Profesional:</strong> {turno.nombre_profesional || 'N/A'}</p>
                </div>
              );
            })}
          </div>
          
          <div className="modal-botones">
            <button className="boton-cerrar" onClick={onCancelar}>Cerrar</button>
          </div>
        </div>
      </div>
    );
  };
  
  // Add these new handler functions
  const handleSeleccionarTurno = (turno) => {
    setTurnoSeleccionado(turno);
    setMostrarSeleccionTurnos(false);
  };
  
  const cerrarSeleccionTurnos = () => {
    setMostrarSeleccionTurnos(false);
  };
    
  // Manejadores para la reprogramación de turno
  const handleReprogramar = () => {
    setMostrarReprogramacion(true);
  };

  const confirmarReprogramacion = (nuevosDatos) => {
    if (!turnoSeleccionado || !turnoSeleccionado.id_turno) {
      console.error('No hay turno seleccionado para reprogramar');
      setMostrarReprogramacion(false);
      return;
    }
    
    setReprogramando(true);
    
    axios.put(`https://spabackend-production-e093.up.railway.app/api/turnos/reprogramar/${turnoSeleccionado.id_turno}`, {
      fecha_hora: nuevosDatos.fechaCompleta
    })
      .then(response => {
        console.log('Reprogramación exitosa:', response.data);
        
        // Actualizamos el estado local de manera más segura
        cargarTurnos();
        
        // Mostrar mensaje de éxito
        alert('El turno ha sido reprogramado exitosamente');
        
        // Cerrar el popup y la ventana de detalles
        setMostrarReprogramacion(false);
        setTurnoSeleccionado(null);
      })
      .catch(error => {
        console.error('Error al reprogramar el turno:', error.response?.data || error.message || error);
        
        const errorMsg = error.response?.data?.error || 'No se pudo reprogramar el turno. Intente nuevamente más tarde.';
        alert(errorMsg);
      })
      .finally(() => {
        setReprogramando(false);
      });
  };
  
  const cancelarReprogramacion = () => {
    setMostrarReprogramacion(false);
  };
  
  // Manejadores para la cancelación de turno
  const handleCancelar = () => {
    setMostrarConfirmacion(true);
  };
  
  const confirmarCancelacion = () => {
    if (!turnoSeleccionado || !turnoSeleccionado.id_turno) {
      console.error('No hay turno seleccionado para cancelar');
      setMostrarConfirmacion(false);
      return;
    }
    
    setCancelando(true);
    
    axios.put(`https://spabackend-production-e093.up.railway.app/api/turnos/cancelar/${turnoSeleccionado.id_turno}`)
      .then(response => {
        console.log('Respuesta exitosa:', response.data);
        
        // Quitar el turno cancelado del estado local de fechasConTurno
        setFechasConTurno(prevTurnos => 
          prevTurnos.filter(turno => turno.id_turno !== turnoSeleccionado.id_turno)
        );
        
        // Mostrar mensaje de éxito
        alert('El turno ha sido cancelado exitosamente');
        
        // Cerrar el popup y la ventana de detalles
        setMostrarConfirmacion(false);
        setTurnoSeleccionado(null);
      })
      .catch(error => {
        console.error('Error al cancelar el turno:', error.response || error);
        // Mostrar un mensaje de error al usuario
        alert('No se pudo cancelar el turno. Intente nuevamente más tarde.');
      })
      .finally(() => {
        setCancelando(false);
      });
  };
  
  const cancelarConfirmacion = () => {
    setMostrarConfirmacion(false);
  };
  
  const handleEditar = () => setEditando(v => !v);
  
  // Actualizar el manejador para guardar los datos del usuario
  const handleGuardar = () => {
    if (!user || !user.id_cliente) return;
    
    // Deshabilitar la edición mientras guardamos
    setEditando(false);
    
    axios.put(`https://spabackend-production-e093.up.railway.app/api/clientes/actualizar/${user.id_cliente}`, datosUsuario)
      .then(response => {
        console.log('Datos actualizados:', response.data);
        alert('Datos actualizados correctamente');
      })
      .catch(error => {
        console.error('Error al actualizar datos:', error);
        alert('No se pudieron actualizar los datos. Intente nuevamente.');
      });
  };
  
  const handleInputChange = e => {
    const { name, value } = e.target;
    setDatosUsuario(prev => ({ ...prev, [name]: value }));
  };

  // 🚦 Renders según estado
  if (loadingAuth) {
    return <div className="perfil-container">Cargando información de usuario…</div>;
  }

  if (errorTurnos && !user) {
    return <div className="perfil-container">{errorTurnos}</div>;
  }

  return (
    <div className="perfil-container">
      {turnoSeleccionado && (
        <div className="modal-turno">
          <div className="modal-contenido">
            <h3>Detalle del turno</h3>
            {(() => {
              const { fecha, hora } = ajustarZonaHoraria(turnoSeleccionado.fecha_hora);
              return (
                <>
                  <p><strong>Fecha:</strong> {fecha}</p>
                  <p><strong>Hora:</strong> {hora}</p>
                  <p><strong>Servicio:</strong> {turnoSeleccionado.nombre_servicio || 'N/A'}</p>
                  <p><strong>Profesional:</strong> {turnoSeleccionado.nombre_profesional || 'N/A'}</p>
                </>
              );
            })()}
            <div className="modal-botones">
              <Boton 
                text={reprogramando ? "Reprogramando..." : "Reprogramar"} 
                onClick={handleReprogramar}
                backgroundColor="#1565c0"
                hoverBackgroundColor="#0d47a1"
                disabled={reprogramando}
              />
              <Boton 
                text={cancelando ? "Cancelando..." : "Cancelar"} 
                onClick={handleCancelar}
                backgroundColor="#c62828"
                hoverBackgroundColor="#b71c1c"
                disabled={cancelando}
              />
              <button className="boton-cerrar" onClick={() => setTurnoSeleccionado(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Popup de confirmación para la cancelación */}
      {mostrarConfirmacion && turnoSeleccionado && (() => {
  const { fecha, hora } = ajustarZonaHoraria(turnoSeleccionado.fecha_hora);
  return (
    <PopupConfirmacion
      titulo="Confirmar cancelación"
      mensaje={`¿Estás seguro que deseas cancelar el turno del ${fecha} a las ${hora}?`}
      submensaje="Esta acción no se puede deshacer."
      textoConfirmar="Sí, cancelar turno"
      textoCancelar="No, mantener turno"
      onConfirmar={confirmarCancelacion}
      onCancelar={cancelarConfirmacion}
      colorConfirmar="#c62828"
      hoverColorConfirmar="#b71c1c"
      colorCancelar="#757575"
      hoverColorCancelar="#616161"
    />
  );
})()}
      
      {/* Popup de reprogramación */}
      {mostrarReprogramacion && turnoSeleccionado && (
        <PopupReprogramacion
          titulo="Reprogramar Turno"
          mensaje="Selecciona una nueva fecha y horario para tu turno:"
          turnoActual={turnoSeleccionado}
          onConfirmar={confirmarReprogramacion}
          onCancelar={cancelarReprogramacion}
          textoConfirmar="Confirmar nueva fecha"
          textoCancelar="Cancelar"
          colorConfirmar="#1565c0"
          hoverColorConfirmar="#0d47a1"
          colorCancelar="#757575"
          hoverColorCancelar="#616161"
        />
      )}
      {mostrarSeleccionTurnos && (
        <SeleccionTurnosPopup
          turnos={multiplesTurnos}
          onSeleccionar={handleSeleccionarTurno}
          onCancelar={cerrarSeleccionTurnos}
        />
      )}
      
      <div className="perfil-seccion turnos-seccion">
        <Etiqueta 
          text="Tus turnos" 
          fontSize="22px" 
          textColor="white" 
          padding="10px 0" 
          className="seccion-titulo"
        />

        {errorTurnos && <div className="error-turnos">{errorTurnos}</div>}

        <div className="turnos-contenido">
          <div className="turnos-calendario">
            {loadingTurnos ? (
              <div className="cargando-turnos">Cargando tus turnos...</div>
            ) : (
              <Calendario
                onDateChange={handleDateChange}
                onTurnoClick={handleTurnoClick}
                turnos={fechasConTurno.map(t => t.fechaAjustada || ajustarZonaHoraria(t.fecha_hora).fecha)}
                backgroundColor="#0c3c6e"
                borderColor="#2a5f8f"
                headerBackgroundColor="#0a325d"
                headerTextColor="#ffffff"
                dayColor="#e0e0e0"
                selectedDayBackground="#1976d2"
                selectedDayColor="#ffffff"
                todayBackground="#2c5282"
                todayColor="#ffffff"
                weekendColor="#90caf9"
                disabledDayColor="#546e7a"
                fontSize="14px"
                borderRadius="8px"
              />
            )}
          </div>
        </div>
      </div>

      <div className="perfil-seccion datos-seccion">
        <Etiqueta 
          text="Datos personales"
          fontSize="22px" 
          textColor="white" 
          padding="10px 0" 
          className="seccion-titulo"
        />
        <div className="datos-contenido">
          {loadingUserData ? (
            <div className="cargando-datos">Cargando datos personales...</div>
          ) : errorUserData ? (
            <div className="error-datos">{errorUserData}</div>
          ) : editando ? (
            <div className="datos-formulario">
              {['nombre','apellido','email','telefono','direccion'].map(field => (
                <div key={field} className="dato-grupo">
                  <label>{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
                  <input 
                    type={field === 'email' ? 'email' : 'text'}
                    name={field}
                    value={datosUsuario[field] || ''}
                    onChange={handleInputChange}
                  />
                </div>
              ))}
              <Boton 
                text="Guardar" 
                onClick={handleGuardar}
                backgroundColor="#00897b"
                hoverBackgroundColor="#00796b"
              />
            </div>
          ) : (
            <div className="datos-visualizacion">
              {Object.entries(datosUsuario).map(([key, val]) => (
                <div key={key} className="dato-item">
                  <Etiqueta text={key.charAt(0).toUpperCase()+key.slice(1)} 
                           textColor="#D8DEC3" 
                           padding="4px 8px" 
                  />
                  <span>{val || 'No especificado'}</span>
                </div>
              ))}
            </div>
          )}
          {!editando && !loadingUserData && (
            <div className="datos-acciones">
              <Boton 
                text="Editar" 
                onClick={handleEditar}
                backgroundColor="#D8DEC3"
                color='#4A3D3D'
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerfilUsuario;