import React, { useEffect, useState } from "react";
import ModalForm from "./ModalForm.jsx";
import ClienteFilterComponent from "./ClienteFilterComponent.jsx";

const ProfClientesSection = () => {
    const [clientes, setClientes] = useState([]);
    const [modo, setModo] = useState("crear");
    const [mostrarModal, setMostrarModal] = useState(false);

    const [clientesOriginales, setClientesOriginales] = useState([]);
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [formulario, setFormulario] = useState({
        id: "",
        nombre: "",
        apellido: "",
        email: "",
        telefono: "",
        direccion: "",
        password: "1",
        fecha_registro: "",
        estado: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filtroTexto, setFiltroTexto] = useState("");

    // Estados para el modal de historial
    const [mostrarHistorial, setMostrarHistorial] = useState(false);
    const [historialTurnos, setHistorialTurnos] = useState([]);
    const [loadingHistorial, setLoadingHistorial] = useState(false);

    // Estado para almacenar el ID del profesional actual
    const [profesionalId, setProfesionalId] = useState(null);

    const clientesFiltrados = clientes.filter(cliente =>
        `${cliente.nombre} ${cliente.apellido} ${cliente.email}`.toLowerCase().includes(filtroTexto.toLowerCase())
    );

    // Función para formatear fecha de forma segura
    const formatearFecha = (fecha) => {
        if (!fecha) return 'Sin fecha';
        
        const fechaObj = new Date(fecha);
        if (isNaN(fechaObj.getTime())) {
            return 'Fecha inválida';
        }
        
        return fechaObj.toLocaleDateString('es-AR');
    };

    // Función para formatear hora de forma segura
    const formatearHora = (hora) => {
        if (!hora) return 'Sin hora';
        return hora;
    };

    // Función para formatear precio de forma segura
    const formatearPrecio = (precio) => {
        if (!precio && precio !== 0) return 'Sin precio';
        return `$${precio}`;
    };

    // Función para obtener el ID del profesional actual
    const obtenerProfesionalId = () => {
        // Opción 1: Si tienes el ID en localStorage
        const profesionalData = localStorage.getItem('profesional');
        if (profesionalData) {
            const profesional = JSON.parse(profesionalData);
            return profesional.id || profesional.id_profesional;
        }

        // Opción 2: Si tienes el ID en sessionStorage
        const sessionProfesional = sessionStorage.getItem('profesional');
        if (sessionProfesional) {
            const profesional = JSON.parse(sessionProfesional);
            return profesional.id || profesional.id_profesional;
        }

        // Opción 3: Si lo pasas como prop desde el componente padre
        // return props.profesionalId;

        // Si no encuentras el ID, puedes usar un valor por defecto o mostrar error
        console.warn('No se pudo obtener el ID del profesional');
        return null;
    };

    useEffect(() => {
        // Obtener el ID del profesional al cargar el componente
        const idProfesional = obtenerProfesionalId();
        setProfesionalId(idProfesional);
    }, []);

    useEffect(() => {
        if (!profesionalId) return; // No hacer la petición si no tenemos el ID del profesional

        const fetchClientesDelProfesional = async () => {
            try {
                setLoading(true);
                
                // Primero obtenemos todos los turnos para encontrar cuáles son del profesional actual
                const turnosResponse = await fetch("https://spabackend-production-e093.up.railway.app/api/turnos");
                if (!turnosResponse.ok) throw new Error("Error al obtener los turnos");
                
                const todosTurnos = await turnosResponse.json();
                
                // Filtramos turnos del profesional actual
                const turnosDelProfesional = todosTurnos.filter(turno => 
                    (turno.profesional_id || turno.id_profesional) === profesionalId
                );
                
                // Extraemos los IDs únicos de clientes que tienen turnos con este profesional
                const clienteIds = [...new Set(turnosDelProfesional.map(turno => 
                    turno.cliente_id || turno.id_cliente
                ))];
                
                if (clienteIds.length === 0) {
                    setClientes([]);
                    setClientesOriginales([]);
                    return;
                }
                
                // Ahora obtenemos los datos completos de esos clientes
                const clientesResponse = await fetch("https://spabackend-production-e093.up.railway.app/api/clientesAdm");
                if (!clientesResponse.ok) throw new Error("Error al obtener los clientes");
                
                const todosLosClientes = await clientesResponse.json();
                
                // Filtramos solo los clientes que tienen turnos con este profesional
                const clientesDelProfesional = todosLosClientes.filter(cliente => 
                    clienteIds.includes(cliente.id || cliente.id_cliente)
                );
                
                const clientesConId = clientesDelProfesional.map(cliente => ({
                    ...cliente,
                    id: cliente.id || cliente.id_cliente
                }));

                setClientes(clientesConId);
                setClientesOriginales(clientesConId);
                
            } catch (error) {
                console.error("Error al cargar los clientes del profesional:", error);
                setError("No se pudieron cargar los clientes. Intenta nuevamente.");
            } finally {
                setLoading(false);
            }
        };

        fetchClientesDelProfesional();
    }, [profesionalId]);

    // Función para obtener el historial de turnos del cliente CON el profesional actual
    const fetchHistorialCliente = async (clienteId) => {
        try {
            setLoadingHistorial(true);
            
            // Usamos el endpoint original y filtramos en el frontend
            const response = await fetch(`https://spabackend-production-e093.up.railway.app/api/turnos/pro/${clienteId}`);
            
            if (!response.ok) throw new Error("Error al obtener el historial");

            const todosLosTurnos = await response.json();
            
            // Filtramos solo los turnos que son con el profesional actual
            const turnosDelProfesional = todosLosTurnos.filter(turno => 
                (turno.profesional_id || turno.id_profesional) === profesionalId
            );
            
            console.log('Datos del historial filtrado:', turnosDelProfesional);
            setHistorialTurnos(turnosDelProfesional);
        } catch (error) {
            console.error("Error al cargar el historial:", error);
            setError("No se pudo cargar el historial del cliente.");
            setHistorialTurnos([]);
        } finally {
            setLoadingHistorial(false);
        }
    };

    const handleEliminar = async () => {
        if (!clienteSeleccionado) return;

        // Abrir modal y cargar historial
        setMostrarHistorial(true);
        await fetchHistorialCliente(clienteSeleccionado.id);
    };

    // Función para cerrar el modal
    const cerrarHistorial = () => {
        setMostrarHistorial(false);
        setHistorialTurnos([]);
        setClienteSeleccionado(null);
    };

    // Función para dar estilo al estado según su valor
    const getEstadoClass = (estado) => {
        if (!estado) return '';
        
        switch (estado) {
            case 'Solicitado':
                return 'estado-solicitado';
            case 'Cancelado':
                return 'estado-cancelado';
            case 'Realizado':
                return 'estado-realizado';
            default:
                return '';
        }
    };

    return (
        <div id="clientes">
            <h2>Mis Clientes</h2>
            {error && <div className="error-message">{error}</div>}

            {loading ? (
                <div className="loading">Cargando...</div>
            ) : clientes.length === 0 ? (
                <div className="no-clientes">
                    <p>Aún no tienes clientes que hayan agendado turnos contigo.</p>
                </div>
            ) : (
                <table className="tabla">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th>Dirección</th>
                            <th>Email</th>
                            <th>Teléfono</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clientes.map(p => (
                            <tr
                                key={p.id}
                                onClick={() => setClienteSeleccionado(p)}
                                style={{
                                    backgroundColor: clienteSeleccionado?.id === p.id ? "#f0f0f0" : "white",
                                    cursor: "pointer",
                                }}
                            >
                                <td>{p.id}</td>
                                <td>{p.nombre || 'Sin nombre'}</td>
                                <td>{p.apellido || 'Sin apellido'}</td>
                                <td>{p.direccion || 'Sin dirección'}</td>
                                <td>{p.email || 'Sin email'}</td>
                                <td>{p.telefono || 'Sin teléfono'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <div className="acciones-turno">
                <button className="btn-eliminar" disabled={!clienteSeleccionado || loading} onClick={handleEliminar}>
                    VER HISTORIAL
                </button>
            </div>

            {/* Modal de Historial */}
            {mostrarHistorial && clienteSeleccionado && (
                <div className="modal-overlay" onClick={cerrarHistorial}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Historial de Turnos</h3>
                            <button className="btn-cerrar" onClick={cerrarHistorial}>×</button>
                        </div>

                        <div className="modal-body">
                            <div className="cliente-info">
                                <h4>Cliente: {clienteSeleccionado.nombre || 'Sin nombre'} {clienteSeleccionado.apellido || 'Sin apellido'}</h4>
                                <p><strong>Email:</strong> {clienteSeleccionado.email || 'Sin email'}</p>
                                <p><strong>Teléfono:</strong> {clienteSeleccionado.telefono || 'Sin teléfono'}</p>
                            </div>

                            {loadingHistorial ? (
                                <div className="loading">Cargando historial...</div>
                            ) : historialTurnos.length === 0 ? (
                                <div className="no-historial">
                                    <p>Este cliente no tiene turnos registrados contigo.</p>
                                </div>
                            ) : (
                                <div className="historial-container">
                                    <h5>Turnos contigo ({historialTurnos.length})</h5>
                                    <div className="tabla-historial-container">
                                        <table className="tabla-historial">
                                            <thead>
                                                <tr>
                                                    <th>Fecha</th>
                                                    <th>Hora</th>
                                                    <th>Servicio</th>
                                                    <th>Profesional</th>
                                                    <th>Precio</th>
                                                    <th>Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {historialTurnos.map((turno, index) => (
                                                    <tr key={turno.id || index}>
                                                        <td>{formatearFecha(turno.fecha)}</td>
                                                        <td>{formatearHora(turno.hora)}</td>
                                                        <td>{turno.servicio || 'Sin servicio'}</td>
                                                        <td>{turno.profesional || 'No asignado'}</td>
                                                        <td>{formatearPrecio(turno.precio)}</td>
                                                        <td className={getEstadoClass(turno.estado)}>
                                                            {turno.estado || 'Sin estado'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button className="btn-cancelar" onClick={cerrarHistorial}>
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
  .modal-overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
    overflow-y: auto;
  }

  .modal-content {
    background-color: #fff;
    border-radius: 12px;
    width: 100%;
    max-width: 900px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #eaeaea;
    background-color: #f9f9f9;
  }

  .modal-header h3 {
    margin: 0;
    color: #222;
    font-size: 1.25rem;
  }

  .btn-cerrar {
    background: transparent;
    border: none;
    font-size: 1.5rem;
    color: #888;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .btn-cerrar:hover {
    color: #222;
  }

  .modal-body {
    padding: 1.5rem;
    overflow-y: auto;
    flex: 1;
  }

  .cliente-info {
    background-color: #f1f3f5;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
  }

  .cliente-info h4 {
    margin-bottom: 0.5rem;
    color: #333;
  }

  .cliente-info p {
    margin: 0.25rem 0;
    color: #555;
  }

  .no-historial, .no-clientes {
    text-align: center;
    padding: 2rem;
    color: #888;
    font-style: italic;
  }

  .historial-container h5 {
    margin-bottom: 1rem;
    color: #333;
  }

  .tabla-historial-container {
    max-height: 400px;
    overflow-y: auto;
    border: 1px solid #ccc;
    border-radius: 6px;
  }

  .tabla-historial {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
  }

  .tabla-historial th,
  .tabla-historial td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #eee;
  }

  .tabla-historial th {
    background-color: #f1f3f5;
    font-weight: 600;
    position: sticky;
    top: 0;
    z-index: 2;
  }

  .tabla-historial tbody tr:hover {
    background-color: #f8f9fa;
  }

  .estado-solicitado {
    color: #007bff;
    font-weight: bold;
  }

  .estado-cancelado {
    color: #dc3545;
    font-weight: bold;
  }

  .estado-realizado {
    color: #28a745;
    font-weight: bold;
  }

  .modal-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid #eaeaea;
    background-color: #f9f9f9;
    text-align: right;
  }

  .btn-cancelar {
    background-color: #6c757d;
    color: #fff;
    border: none;
    padding: 0.5rem 1.25rem;
    border-radius: 4px;
    font-size: 0.9rem;
    cursor: pointer;
  }

  .btn-cancelar:hover {
    background-color: #5a6268;
  }

  .loading {
    text-align: center;
    padding: 1.5rem;
    color: #555;
  }

  .error-message {
    background-color: #f8d7da;
    color: #721c24;
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 1rem;
  }
`}</style>

        </div>
    );
};

export default ProfClientesSection;