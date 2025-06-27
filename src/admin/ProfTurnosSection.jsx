import React, { useState, useEffect } from "react";
import ModalForm from "./ModalForm.jsx";
import DropdownCategorias from "./dropDownCat.jsx";
import DropdownServicios from "./dropDownServicios.jsx";
import DropdownClientes from "./DropdownClientes.jsx";
import DropdownProfesionalesPorServicio from "./DropdownProfesionalesPorServicio.jsx";
import FilterComponent from "./FilterComponent.jsx";

const ProfTurnosSection = () => {
    const [turnos, setTurnos] = useState([]);
    const [turnosFiltrados, setTurnosFiltrados] = useState([]);
    const [modo, setModo] = useState("crear");
    const [mostrarModal, setMostrarModal] = useState(false);
    const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);
    const [servicios, setServicios] = useState([]);
    const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
    const [servicioIdSeleccionado, setServicioIdSeleccionado] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formulario, setFormulario] = useState({
        fecha: "",
        hora: "",
        categoria: "",
        servicio: "",
        servicio_id: "",
        cliente_id: "",
        cliente_nombre: "",
    });
    const [categorias, setCategorias] = useState([]);
    const horasDisponibles = Array.from({ length: 14 }, (_, i) => `${(8 + i).toString().padStart(2, '0')}:00`);

    // Estados de turnos disponibles para filtrar
    const estadosTurnos = ['Solicitado', 'Cancelado'];

    const fetchServicios = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Usamos una marca de tiempo para evitar caché
            const timestamp = new Date().getTime();
            const response = await fetch(`https://spabackend-production-e093.up.railway.app/api/serviciosAdm?_=${timestamp}`);

            if (!response.ok) {
                throw new Error("Error al obtener los servicios");
            }

            const data = await response.json();
            console.log("Servicios actualizados:", data);
            setServicios(data);
        } catch (error) {
            console.error("Error al cargar los servicios:", error);
            setError("No se pudieron cargar los servicios. Intenta nuevamente.");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTurnos = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch("https://spabackend-production-e093.up.railway.app/api/turnosAdmin");
            if (!response.ok) {
                throw new Error("Error al obtener los turnos");
            }
            const data = await response.json();
            console.log("Turnos recibidos:", data);
            setTurnos(data);
            setTurnosFiltrados(data); // Inicialmente, turnos filtrados = todos los turnos
        } catch (error) {
            console.error("Error al cargar los turnos:", error);
            setError("No se pudieron cargar los turnos. Intenta nuevamente.");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCategorias = async () => {
        try {
            const response = await fetch("https://spabackend-production-e093.up.railway.app/api/categoriasAdm");
            if (!response.ok) throw new Error("Error al obtener categorias");
            const data = await response.json();
            setCategorias(data);
        } catch (error) {
            console.log("Error cargando categorias:", error);
            setError("No se pudieron cargar las categorias");
        }
    }

    useEffect(() => {
        fetchCategorias();
        fetchServicios();
        fetchTurnos();
    }, []);

    // Función para manejar el cambio en el filtro
    const handleFilterChange = (filteredData) => {
        setTurnosFiltrados(filteredData);
    };

    // Función para obtener la fecha de mañana en formato YYYY-MM-DD
    const getFechaMañana = () => {
        const mañana = new Date();
        mañana.setDate(mañana.getDate() + 1);
        return mañana.toISOString().split('T')[0];
    };

    // Función para generar e imprimir PDF con los turnos de mañana
    const handleAgregar = () => {
        const fechaMañana = getFechaMañana();
        
        // Filtrar turnos para mañana
        const turnosMañana = turnos.filter(turno => {
            // Asumiendo que turno.fecha está en formato YYYY-MM-DD o similar
            const fechaTurno = turno.fecha.split('T')[0] || turno.fecha;
            return fechaTurno === fechaMañana && turno.estado === 'Solicitado';
        });

        if (turnosMañana.length === 0) {
            alert('No hay turnos programados para mañana.');
            return;
        }

        // Ordenar turnos por hora
        turnosMañana.sort((a, b) => a.hora.localeCompare(b.hora));

        // Generar contenido HTML para el PDF
        const contenidoHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Turnos para Mañana</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 20px;
                        font-size: 12px;
                    }
                    h1 { 
                        text-align: center; 
                        color: #333;
                        margin-bottom: 20px;
                    }
                    .fecha-titulo {
                        text-align: center;
                        color: #666;
                        margin-bottom: 30px;
                        font-size: 14px;
                    }
                    table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        margin-top: 20px;
                    }
                    th, td { 
                        border: 1px solid #ddd; 
                        padding: 8px; 
                        text-align: left;
                    }
                    th { 
                        background-color: #f2f2f2; 
                        font-weight: bold;
                    }
                    tr:nth-child(even) { 
                        background-color: #f9f9f9; 
                    }
                    .estado-solicitado { 
                        color: #0066cc; 
                        font-weight: bold; 
                    }
                    .estado-cancelado { 
                        color: #cc0000; 
                        font-weight: bold; 
                    }
                    .estado-realizado { 
                        color: #009900; 
                        font-weight: bold; 
                    }
                    .total-turnos {
                        margin-top: 20px;
                        text-align: right;
                        font-weight: bold;
                    }
                </style>
            </head>
            <body>
                <h1>TURNOS PROGRAMADOS PARA MAÑANA</h1>
                <div class="fecha-titulo">
                    Fecha: ${new Date(fechaMañana + 'T12:00:00').toLocaleDateString('es-AR', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Hora</th>
                            <th>Cliente</th>
                            <th>Servicio</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${turnosMañana.map(turno => `
                            <tr>
                                <td>${turno.hora}</td>
                                <td>${turno.cliente}</td>
                                <td>${turno.servicio}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div class="total-turnos">
                    Total de turnos: ${turnosMañana.length}
                </div>
            </body>
            </html>
        `;

        // Crear una nueva ventana e imprimir
        const ventanaImpresion = window.open('', '_blank');
        ventanaImpresion.document.open();
        ventanaImpresion.document.write(contenidoHTML);
        ventanaImpresion.document.close();
        
        // Esperar a que se cargue el contenido y luego imprimir
        ventanaImpresion.onload = () => {
            ventanaImpresion.focus();
            ventanaImpresion.print();
            // Opcional: cerrar la ventana después de imprimir
            // ventanaImpresion.onafterprint = () => ventanaImpresion.close();
        };
    };

    // Función para dar estilo al estado según su valor
    const getEstadoClass = (estado) => {
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
        <div id="turnos" className="turnos-container">
            <h2>Turnos</h2>

            {error && <div className="error-message">{error}</div>}

            <div className="turnos-header-flex">
                <div className="btns-izquierda">
                    <button className="btn-agregar" onClick={handleAgregar} disabled={isLoading}>
                        IMPRIMIR TURNOS PARA MAÑANA
                    </button>
                </div>
                <div className="btns-derecha">
                    <FilterComponent
                        data={turnos}
                        onFilterChange={handleFilterChange}
                        searchField="cliente"
                        placeholder="Buscar por cliente..."
                        title="Filtrar turnos"
                        showStatusFilter={true}
                        availableStatuses={estadosTurnos}
                    />
                </div>
            </div>

            {isLoading ? (
                <p>Cargando...</p>
            ) : (
                <div className="tabla-container">
                    <table className="tabla">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Fecha</th>
                                <th>Hora</th>
                                <th>Cliente</th>
                                <th>Servicio</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {turnosFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: "center" }}>
                                        No hay turnos disponibles
                                    </td>
                                </tr>
                            ) : (
                                turnosFiltrados.map(t => (
                                    <tr
                                        key={t.id}
                                        onClick={() => setTurnoSeleccionado(t)}
                                        style={{
                                            backgroundColor: turnoSeleccionado?.id === t.id ? "#f0f0f0" : "white",
                                            cursor: "pointer",
                                        }}
                                    >
                                        <td>{t.id}</td>
                                        <td>{t.fecha}</td>
                                        <td>{t.hora}</td>
                                        <td>{t.cliente}</td>
                                        <td>{t.servicio}</td>
                                        <td className={getEstadoClass(t.estado)}>{t.estado}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
            
        </div>
    );
};

export default ProfTurnosSection;