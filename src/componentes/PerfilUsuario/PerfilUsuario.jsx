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
import { usePopupContext } from '../popupcontext.jsx';

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
  const { showPopup } = usePopupContext();

  useEffect(() => {
    if (loadingAuth) return;

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

    console.log("Cargando turnos para el cliente ID:", user.id_cliente);
    cargarTurnos();
    cargarDatosUsuario();
  }, [loadingAuth, user]);

  // Función corregida para ajustar zona horaria (+3 horas para Argentina)
  const ajustarZonaHoraria = (fechaHoraString) => {
    if (!fechaHoraString) return { fecha: '', hora: '' };

    // Crear fecha UTC y sumar 3 horas para Argentina
    const fechaUTC = new Date(fechaHoraString);
    const fechaArgentina = new Date(fechaUTC.getTime() + (3 * 60 * 60 * 1000));

    const fechaAjustada = `${fechaArgentina.getFullYear()}-${String(fechaArgentina.getMonth() + 1).padStart(2, '0')}-${String(fechaArgentina.getDate()).padStart(2, '0')}`;
    const horaAjustada = `${String(fechaArgentina.getHours()).padStart(2, '0')}:${String(fechaArgentina.getMinutes()).padStart(2, '0')}`;

    return { fecha: fechaAjustada, hora: horaAjustada };
  };

  // Función para verificar si faltan menos de 48 horas para un turno
  const esDentroDeVentana48Horas = (fechaHoraTurno) => {
    if (!fechaHoraTurno) return false;

    const fechaUTC = new Date(fechaHoraTurno);
    const fechaArgentinaTurno = new Date(fechaUTC.getTime() + (3 * 60 * 60 * 1000));
    const ahora = new Date();
    
    const diferenciaMs = fechaArgentinaTurno.getTime() - ahora.getTime();
    const diferencia48Horas = 48 * 60 * 60 * 1000; // 48 horas en millisegundos
    
    console.log('Verificando ventana 48hs:', {
      fechaTurno: fechaArgentinaTurno,
      ahora: ahora,
      diferenciaHoras: diferenciaMs / (60 * 60 * 1000),
      esDentroVentana: diferenciaMs < diferencia48Horas
    });
    
    return diferenciaMs < diferencia48Horas;
  };

  // Función para calcular la fecha mínima de reprogramación (48hs desde ahora)
  const getFechaMinReprogramacion = () => {
    const ahora = new Date();
    const fecha48HorasDesdeAhora = new Date(ahora.getTime() + (48 * 60 * 60 * 1000));
    return fecha48HorasDesdeAhora;
  };

  const cargarTurnos = () => {
    if (!user || !user.id_cliente) return;

    setLoadingTurnos(true);
    setErrorTurnos(null);

    const endpoint = `https://spabackend-production-e093.up.railway.app/api/turnos/${user.id_cliente}`;
    console.log("Consultando turnos en:", endpoint);

    axios.get(endpoint)
      .then(res => {
        console.log("Turnos recibidos:", res.data);

        const turnosActivos = res.data.filter(turno => turno.estado !== 'Cancelado');
        console.log("Turnos activos filtrados:", turnosActivos);

        const turnosProcesados = turnosActivos.map(turno => {
          const turnoProcesado = { ...turno };
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

  const handleDateChange = date => setFechaSeleccionada(date);
  
  const handleTurnoClick = (fecha) => {
    const turnosDelDia = fechasConTurno.filter(t => {
      const { fecha: fechaAjustada } = ajustarZonaHoraria(t.fecha_hora);
      return fechaAjustada === fecha;
    });

    if (turnosDelDia.length > 0) {
      if (turnosDelDia.length === 1) {
        setTurnoSeleccionado(turnosDelDia[0]);
      } else {
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

  const handleSeleccionarTurno = (turno) => {
    setTurnoSeleccionado(turno);
    setMostrarSeleccionTurnos(false);
  };

  const cerrarSeleccionTurnos = () => {
    setMostrarSeleccionTurnos(false);
  };

  // Validar si se puede reprogramar (no dentro de ventana de 48hs)
  const puedeReprogramar = (turno) => {
    return !esDentroDeVentana48Horas(turno.fecha_hora);
  };

  // Validar si se puede cancelar (no dentro de ventana de 48hs)
  const puedeCancelar = (turno) => {
    return !esDentroDeVentana48Horas(turno.fecha_hora);
  };

  const handleReprogramar = () => {
    if (!puedeReprogramar(turnoSeleccionado)) {
      showPopup({
        type: 'warning',
        title: 'No se puede reprogramar',
        message: 'No puedes reprogramar un turno con menos de 48 horas de anticipación.',
      });
      return;
    }
    setMostrarReprogramacion(true);
  };

  const confirmarReprogramacion = (nuevosDatos) => {
    if (!turnoSeleccionado || !turnoSeleccionado.id_turno) {
      console.error('No hay turno seleccionado para reprogramar');
      setMostrarReprogramacion(false);
      return;
    }

    // Validar que la nueva fecha no sea dentro de las próximas 48 horas
    const fechaMinima = getFechaMinReprogramacion();
    const nuevaFecha = new Date(nuevosDatos.fechaCompleta);
    
    if (nuevaFecha < fechaMinima) {
      showPopup({
        type: 'warning',
        title: 'Fecha no válida',
        message: 'No puedes reprogramar para una fecha dentro de las próximas 48 horas.',
      });
      return;
    }

    setReprogramando(true);

    axios.put(`https://spabackend-production-e093.up.railway.app/api/turnos/reprogramar/${turnoSeleccionado.id_turno}`, {
      fecha_hora: nuevosDatos.fechaCompleta
    })
      .then(response => {
        console.log('Reprogramación exitosa:', response.data);

        cargarTurnos();

        showPopup({
          type: 'success',
          title: 'Turno reprogramado',
          message: 'El turno ha sido reprogramado exitosamente',
        });

        setMostrarReprogramacion(false);
        setTurnoSeleccionado(null);
      })
      .catch(error => {
        console.error('Error al reprogramar el turno:', error.response?.data || error.message || error);

        const errorMsg = error.response?.data?.error || 'No se pudo reprogramar el turno. Intente nuevamente más tarde.';
        showPopup({
          type: 'error',
          title: 'Error al reprogramar',
          message: errorMsg,
        });
      })
      .finally(() => {
        setReprogramando(false);
      });
  };

  const cancelarReprogramacion = () => {
    setMostrarReprogramacion(false);
  };

  const handleCancelar = () => {
    if (!puedeCancelar(turnoSeleccionado)) {
      showPopup({
        type: 'warning',
        title: 'No se puede cancelar',
        message: 'No puedes cancelar un turno con menos de 48 horas de anticipación.',
      });
      return;
    }
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

        setFechasConTurno(prevTurnos =>
          prevTurnos.filter(turno => turno.id_turno !== turnoSeleccionado.id_turno)
        );

        showPopup({
          type: 'success',
          title: 'Turno cancelado',
          message: 'El turno ha sido cancelado exitosamente',
        });

        setMostrarConfirmacion(false);
        setTurnoSeleccionado(null);
      })
      .catch(error => {
        console.error('Error al cancelar el turno:', error.response || error);
        showPopup({
          type: 'error',
          title: 'Error al cancelar',
          message: 'No se pudo cancelar el turno. Intente nuevamente más tarde.',
        });
      })
      .finally(() => {
        setCancelando(false);
      });
  };

  const cancelarConfirmacion = () => {
    setMostrarConfirmacion(false);
  };

  const handleEditar = () => setEditando(v => !v);

  const handleGuardar = () => {
    if (!user || !user.id_cliente) return;

    setEditando(false);

    axios.put(`https://spabackend-production-e093.up.railway.app/api/clientes/actualizar/${user.id_cliente}`, datosUsuario)
      .then(response => {
        console.log('Datos actualizados:', response.data);
        showPopup({
          type: 'success',
          title: 'Datos actualizados',
          message: 'Los datos se han actualizado correctamente.',
        });
      })
      .catch(error => {
        console.error('Error al actualizar datos:', error);
        showPopup({
          type: 'error',
          title: 'Error al actualizar',
          message: 'No se pudieron actualizar los datos. Intente nuevamente.',
        });
      });
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setDatosUsuario(prev => ({ ...prev, [name]: value }));
  };

  if (loadingAuth) {
    return <div className="perfil-container">Cargando información de usuario…</div>;
  }

  if (errorTurnos && !user) {
    return <div className="perfil-container">{errorTurnos}</div>;
  }

  // Calcular si los botones deben estar deshabilitados
  const reprogramarDeshabilitado = turnoSeleccionado ? !puedeReprogramar(turnoSeleccionado) : false;
  const cancelarDeshabilitado = turnoSeleccionado ? !puedeCancelar(turnoSeleccionado) : false;

  return (
    <div className="perfil-container">
      {turnoSeleccionado && (
        <div className="modal-turno">
          <div className="modal-contenido">
            <h3>Detalle del turno</h3>
            {(() => {
              const { fecha, hora } = ajustarZonaHoraria(turnoSeleccionado.fecha_hora);
              const dentroVentana48hs = esDentroDeVentana48Horas(turnoSeleccionado.fecha_hora);
              
              return (
                <>
                  <p><strong>Fecha:</strong> {fecha}</p>
                  <p><strong>Hora:</strong> {hora}</p>
                  <p><strong>Servicio:</strong> {turnoSeleccionado.nombre_servicio || 'N/A'}</p>
                  <p><strong>Profesional:</strong> {turnoSeleccionado.nombre_profesional || 'N/A'}</p>
                  
                  {dentroVentana48hs && (
                    <div style={{
                      backgroundColor: '#fff3cd',
                      color: '#856404',
                      padding: '10px',
                      borderRadius: '5px',
                      margin: '10px 0',
                      border: '1px solid #ffeaa7'
                    }}>
                      <strong>⚠️ Aviso:</strong> Este turno no se puede modificar o cancelar porque faltan menos de 48 horas.
                    </div>
                  )}
                </>
              );
            })()}
            <div className="modal-botones">
              <Boton
                text={reprogramando ? "Reprogramando..." : "Reprogramar"}
                onClick={handleReprogramar}
                backgroundColor={reprogramarDeshabilitado ? "#cccccc" : "#1565c0"}
                hoverBackgroundColor={reprogramarDeshabilitado ? "#cccccc" : "#0d47a1"}
                disabled={reprogramando || reprogramarDeshabilitado}
              />
              <Boton
                text={cancelando ? "Cancelando..." : "Cancelar"}
                onClick={handleCancelar}
                backgroundColor={cancelarDeshabilitado ? "#cccccc" : "#c62828"}
                hoverBackgroundColor={cancelarDeshabilitado ? "#cccccc" : "#b71c1c"}
                disabled={cancelando || cancelarDeshabilitado}
              />
              <button className="boton-cerrar" onClick={() => setTurnoSeleccionado(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

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
          fechaMinima={getFechaMinReprogramacion()} // Pasar la fecha mínima al popup
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
              {['nombre', 'apellido', 'email', 'telefono', 'direccion'].map(field => (
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
                  <Etiqueta text={key.charAt(0).toUpperCase() + key.slice(1)}
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