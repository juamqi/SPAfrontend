import React, { useEffect, useState } from "react";
import ModalForm from "./ModalForm.jsx";
import ClienteFilterComponent from "./ClienteFilterComponent.jsx";
import { useProfAuth } from '../context/ProfAuthContext'; // Importar el contexto

const ProfClientesSection = () => {
    const { profesional } = useProfAuth(); // Usar el contexto
    const profesionalId = profesional?.id_profesional; // Obtener ID del contexto
    
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

    useEffect(() => {
        const fetchClientesDelProfesional = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Si no hay profesional del contexto, no cargar nada
                if (!profesional?.nombre) {
                    console.log("No hay nombre de profesional en el contexto");
                    setClientes([]);
                    setClientesOriginales([]);
                    return;
                }

                console.log("Cargando clientes para profesional:", profesional.nombre);

                // 1. Obtener todos los turnos del endpoint de turnos admin
                const turnosResponse = await fetch("https://spabackend-production-e093.up.railway.app/api/turnosAdmin");
                if (!turnosResponse.ok) throw new Error("Error al obtener los turnos");
                
                const todosTurnos = await turnosResponse.json();
                console.log("Total de turnos obtenidos:", todosTurnos.length);
                console.log("Ejemplo de turno:", todosTurnos[0]);
                
                // 2. Filtrar turnos del profesional actual por NOMBRE
                const turnosDelProfesional = todosTurnos.filter(turno => {
                    const coincide = turno.profesional === profesional.nombre;
                    if (coincide) {
                        console.log(`✓ Turno ${turno.id} del profesional - Cliente: ${turno.cliente}`);
                    }
                    return coincide;
                });

                console.log("Turnos del profesional encontrados:", turnosDelProfesional.length);
                
                // 3. Extraer nombres únicos de clientes de esos turnos
                const nombresClientesUnicos = [...new Set(
                    turnosDelProfesional
                        .map(turno => turno.cliente)
                        .filter(nombre => nombre && nombre.trim() !== '')
                )];
                
                console.log("Nombres de clientes únicos extraídos:", nombresClientesUnicos);

                if (nombresClientesUnicos.length === 0) {
                    console.log("No se encontraron nombres de clientes en los turnos");
                    setClientes([]);
                    setClientesOriginales([]);
                    return;
                }

                // 4. Obtener todos los clientes del endpoint de admin
                const clientesResponse = await fetch("https://spabackend-production-e093.up.railway.app/api/clientesAdm");
                if (!clientesResponse.ok) throw new Error("Error al obtener los clientes");

                const todosLosClientes = await clientesResponse.json();
                console.log("Total de clientes en BD:", todosLosClientes.length);
                
                // 5. Filtrar clientes que coincidan por nombre completo
                const clientesDelProfesional = todosLosClientes.filter(cliente => {
                    const nombreCompleto = `${cliente.nombre} ${cliente.apellido}`.trim();
                    const tieneturno = nombresClientesUnicos.includes(nombreCompleto);
                    
                    if (tieneturno) {
                        console.log(`✓ Cliente ${cliente.id_cliente || cliente.id} (${nombreCompleto}) tiene turnos con este profesional`);
                    }
                    
                    return tieneturno;
                }).map(cliente => ({
                    ...cliente,
                    id: cliente.id_cliente || cliente.id, // Normalizar el ID
                    nombreCompleto: `${cliente.nombre} ${cliente.apellido}`.trim()
                }));

                console.log("Clientes finales del profesional:", clientesDelProfesional.length);

                // 6. Guardar los resultados
                setClientes(clientesDelProfesional);
                setClientesOriginales(clientesDelProfesional);
                
                // Debug final
                clientesDelProfesional.forEach(cliente => {
                    console.log(`Cliente final: ID=${cliente.id}, Nombre=${cliente.nombreCompleto}`);
                });
                
            } catch (error) {
                console.error("Error al cargar los clientes del profesional:", error);
                setError("No se pudieron cargar los clientes. Intenta nuevamente.");
            } finally {
                setLoading(false);
            }
        };

        // Solo ejecutar si hay profesional en el contexto
        if (profesional?.nombre) {
            fetchClientesDelProfesional();
        }
    }, [profesional]);

    // Función para obtener el historial de turnos del cliente CON ESTE PROFESIONAL
    const fetchHistorialCliente = async (clienteId) => {
        try {
            setLoadingHistorial(true);
            
            console.log("Cargando historial para cliente ID:", clienteId, "profesional:", profesional.nombre);
            
            // Obtener el cliente para saber su nombre completo
            const clienteSeleccionadoNombre = clienteSeleccionado?.nombreCompleto || 
                                            `${clienteSeleccionado?.nombre} ${clienteSeleccionado?.apellido}`.trim();
            
            console.log("Nombre completo del cliente:", clienteSeleccionadoNombre);
            
            // Obtener todos los turnos y filtrar por nombre del cliente y profesional
            const response = await fetch("https://spabackend-production-e093.up.railway.app/api/turnosAdmin");
            if (!response.ok) throw new Error("Error al obtener los turnos");
            
            const todosTurnos = await response.json();
            
            // Filtrar turnos del cliente con este profesional específico (por nombres)
            const turnosFiltrados = todosTurnos.filter(turno => {
                const esCliente = turno.cliente === clienteSeleccionadoNombre;
                const esProfesional = turno.profesional === profesional.nombre;
                
                if (esCliente && esProfesional) {
                    console.log(`✓ Turno encontrado: ${turno.id} - ${turno.fecha} ${turno.hora} - ${turno.estado}`);
                }
                
                return esCliente && esProfesional;
            });

            console.log("Turnos del cliente con este profesional:", turnosFiltrados.length);
            setHistorialTurnos(turnosFiltrados);
            
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

    // Mostrar mensaje si no hay profesional en el contexto
    if (!profesional?.id_profesional) {
        return (
            <div id="clientes">
                <h2>Clientes</h2>
                <div className="no-profesional">
                    <p>No se pudo identificar al profesional actual.</p>
                    <p><small>Por favor, inicia sesión nuevamente.</small></p>
                </div>
            </div>
        );
    }

    return (
        <div id="clientes">
            <h2>Mis Clientes</h2>
            <p className="subtitle">Clientes que han agendado turnos conmigo</p>
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
                        {clientesFiltrados.map(p => (
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
                            <h3>Historial de Turnos Conmigo</h3>
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
                                    <h5>Turnos Conmigo ({historialTurnos.length})</h5>
                                    <div className="tabla-historial-container">
                                        <table className="tabla-historial">
                                            <thead>
                                                <tr>
                                                    <th>Fecha</th>
                                                    <th>Hora</th>
                                                    <th>Servicio</th>
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
  .subtitle {
    color: var(--color-accent);
    font-style: italic;
    margin-bottom: 1rem;
    font-size: 0.95rem;
  }

  .no-profesional,
  .no-clientes {
    text-align: center;
    padding: 2rem;
    background-color: rgba(75, 44, 32, 0.05);
    border-radius: var(--border-radius);
    color: var(--color-accent);
    font-style: italic;
  }

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

  .no-historial {
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