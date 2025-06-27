import React, { useState, useEffect } from "react";
import ModalForm from "./ModalForm.jsx";
import DropdownClientes from "./DropdownClientes.jsx";
import FilterComponent from "./FilterComponent.jsx";
import { usePopupContext } from "../componentes/popupcontext.jsx";
import { useProfAuth } from '../context/ProfAuthContext';

const ProfTurnosSection = () => {
    const { profesional } = useProfAuth();
    const profesionalId = profesional?.id_profesional;
    const [turnos, setTurnos] = useState([]);
    const [turnosFiltrados, setTurnosFiltrados] = useState([]);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);
    const [servicioDelProfesional, setServicioDelProfesional] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formulario, setFormulario] = useState({
        fecha: "",
        hora: "",
        cliente_id: "",
        cliente_nombre: "",
        comentarios: "",
    });
    const horasDisponibles = Array.from({ length: 14 }, (_, i) => `${(8 + i).toString().padStart(2, '0')}:00`);
    const { showPopup } = usePopupContext();
    const [fechaParaImprimir, setFechaParaImprimir] = useState("");

    // Estados de turnos disponibles para filtrar
    const estadosTurnos = ['Solicitado', 'Cancelado'];

    // Obtener el servicio del profesional logueado
    const fetchServicioDelProfesional = async () => {
        if (!profesionalId) return;
        
        try {
            const response = await fetch(`https://spabackend-production-e093.up.railway.app/api/serviciosAdm/profesional/${profesionalId}`);
            if (response.ok) {
                const servicio = await response.json();
                setServicioDelProfesional(servicio);
                console.log("Servicio del profesional cargado:", servicio);
            } else {
                console.error("No se encontró servicio para este profesional");
                setError("No se pudo cargar el servicio asignado a este profesional. Contacte al administrador.");
            }
        } catch (error) {
            console.error("Error al obtener el servicio del profesional:", error);
            setError("Error al cargar el servicio del profesional.");
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

            // Filtrar turnos del profesional logueado por NOMBRE
            const turnosDelProfesional = data.filter(t =>
                t.profesional === profesional?.nombre
            );

            console.log("Turnos filtrados del profesional:", turnosDelProfesional);
            setTurnos(turnosDelProfesional);
            setTurnosFiltrados(turnosDelProfesional);
        } catch (error) {
            console.error("Error al cargar los turnos:", error);
            setError("No se pudieron cargar los turnos. Intenta nuevamente.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (profesional?.id_profesional) {
            fetchServicioDelProfesional();
            fetchTurnos();

            // Establecer la fecha de mañana como valor por defecto
            const mañana = new Date();
            mañana.setDate(mañana.getDate() + 1);
            setFechaParaImprimir(mañana.toISOString().split('T')[0]);
        }
    }, [profesional]);

    // Función para manejar el cambio en el filtro
    const handleFilterChange = (filteredData) => {
        setTurnosFiltrados(filteredData);
    };

    // Función para obtener la fecha de hoy en formato YYYY-MM-DD
    const getFechaHoy = () => {
        return new Date().toLocaleDateString('en-CA');
    };

    // Agregar turno - SIMPLIFICADO
    const handleAgregar = () => {
        const fechaHoy = new Date().toLocaleDateString('en-CA');
        setFormulario({
            fecha: fechaHoy,
            hora: "",
            cliente_id: "",
            cliente_nombre: "",
            comentarios: "",
        });
        setMostrarModal(true);
    };

    // Validar formulario - SIMPLIFICADO
    const validarFormulario = () => {
        const camposRequeridos = ['fecha', 'hora', 'cliente_id'];
        const camposFaltantes = camposRequeridos.filter(campo => !formulario[campo]);

        if (camposFaltantes.length > 0) {
            const mensajesCampos = {
                'fecha': 'Fecha',
                'hora': 'Hora',
                'cliente_id': 'Cliente'
            };

            const camposFaltantesNombres = camposFaltantes.map(campo => mensajesCampos[campo]);
            throw new Error(`Por favor complete todos los campos obligatorios: ${camposFaltantesNombres.join(', ')}`);
        }

        if (!servicioDelProfesional) {
            throw new Error("No se pudo identificar el servicio del profesional. Por favor, contacte al administrador.");
        }

        // Validar formato de fecha
        const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!fechaRegex.test(formulario.fecha)) {
            throw new Error("El formato de fecha no es válido. Utilice YYYY-MM-DD");
        }

        // Verificar que la fecha no sea anterior a hoy
        const fechaHoy = new Date();
        fechaHoy.setHours(0, 0, 0, 0);

        const fechaSeleccionada = new Date(formulario.fecha + 'T00:00');

        if (fechaSeleccionada < fechaHoy) {
            throw new Error("No se puede agendar un turno en una fecha que ya pasó");
        }

        // Validar formato de hora
        const horaRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!horaRegex.test(formulario.hora)) {
            throw new Error("El formato de hora no es válido. Utilice HH:MM");
        }

        return true;
    };

    // Guardar turno - SIMPLIFICADO
    const handleGuardar = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Validar el formulario
            validarFormulario();

            // Conversión explícita y segura de IDs a enteros
            const id_servicio = parseInt(servicioDelProfesional.id, 10);
            const id_cliente = parseInt(formulario.cliente_id, 10);
            const id_profesional = parseInt(profesionalId, 10);

            // Validaciones adicionales
            if (isNaN(id_servicio)) {
                throw new Error("Error con el servicio del profesional. Por favor contacte al administrador.");
            }

            if (isNaN(id_cliente)) {
                throw new Error("El ID del cliente no es válido. Por favor seleccione un cliente válido.");
            }

            if (isNaN(id_profesional)) {
                throw new Error("Error: No se pudo identificar el profesional. Por favor inicie sesión nuevamente.");
            }

            // Preparar los datos para enviar al backend
            const datosFormateados = {
                id_cliente,
                id_servicio,
                id_profesional,
                fecha: formulario.fecha,
                hora: formulario.hora,
                estado: 'Solicitado',
                precio: parseFloat(servicioDelProfesional.precio) || 0,
                comentarios: formulario.comentarios || '',
                // Añadimos también los nombres para compatibilidad
                profesional: profesional?.nombre,
                cliente: formulario.cliente_nombre,
                servicio: servicioDelProfesional.nombre
            };

            console.log("Datos a enviar al backend:", datosFormateados);

            // Crear nuevo turno
            const response = await fetch('https://spabackend-production-e093.up.railway.app/api/turnosAdmin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosFormateados)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Error al crear el turno");
            }

            showPopup({
                type: 'success',
                title: "Éxito",
                message: "Turno creado correctamente",
            });

            // Recargar los turnos
            await fetchTurnos();

            // Cerrar el modal
            setMostrarModal(false);

        } catch (error) {
            console.error("Error al guardar el turno:", error);
            setError(`Error al guardar el turno: ${error.message}`);
            showPopup({
                type: 'error',
                title: "Error",
                message: `Error al guardar el turno: ${error.message}`,
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Manejo de cliente
    const handleClienteChange = (clienteId, nombreCompleto) => {
        console.log("Cliente seleccionado - ID:", clienteId, "Nombre:", nombreCompleto);

        setFormulario({
            ...formulario,
            cliente_id: clienteId,
            cliente_nombre: nombreCompleto
        });
    };

    // Función para generar e imprimir PDF con los turnos de la fecha seleccionada
    const handleImprimirTurnos = () => {
        if (!fechaParaImprimir) {
            showPopup({
                type: 'warning',
                title: "Atención",
                message: "Por favor selecciona una fecha para imprimir los turnos.",
            });
            return;
        }

        const turnosDia = turnos.filter(turno => {
            const fechaTurno = turno.fecha.split('T')[0];
            const esFechaCorrecta = fechaTurno === fechaParaImprimir;
            const esEstadoCorrecto = turno.estado === 'Solicitado';
            return esFechaCorrecta && esEstadoCorrecto;
        });

        if (turnosDia.length === 0) {
            showPopup({
                type: 'info',
                title: "Información",
                message: `No hay turnos programados para el ${new Date(fechaParaImprimir + 'T12:00:00').toLocaleDateString('es-AR')}.`,
            });
            return;
        }

        turnosDia.sort((a, b) => a.hora.localeCompare(b.hora));

        const fechaFormateada = new Date(fechaParaImprimir + 'T12:00:00').toLocaleDateString('es-AR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const contenidoHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Turnos - ${fechaFormateada}</title>
                <style>
                    body { font-family: Arial; margin: 20px; font-size: 12px; }
                    h1 { text-align: center; margin-bottom: 20px; color: #333; }
                    .profesional-info { text-align: center; margin-bottom: 10px; font-size: 14px; font-weight: bold; }
                    .servicio-info { text-align: center; margin-bottom: 10px; font-size: 12px; color: #666; }
                    .fecha-titulo { text-align: center; margin-bottom: 30px; font-size: 14px; color: #666; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                    th { background-color: #f2f2f2; font-weight: bold; }
                    tr:nth-child(even) { background-color: #f9f9f9; }
                    .resumen { margin-top: 30px; padding: 15px; background-color: #f8f9fa; border-radius: 5px; }
                    .resumen h3 { margin-top: 0; color: #495057; }
                    .total-ingresos { color: #28a745; font-weight: bold; }
                </style>
            </head>
            <body>
                <h1>TURNOS PROGRAMADOS</h1>
                <div class="profesional-info">Profesional: ${profesional?.nombre || 'N/A'}</div>
                <div class="servicio-info">Servicio: ${servicioDelProfesional?.nombre || 'N/A'}</div>
                <div class="fecha-titulo">Fecha: ${fechaFormateada}</div>
                <table>
                    <thead>
                        <tr>
                            <th>Hora</th>
                            <th>Cliente</th>
                            <th>Precio</th>
                            <th>Comentarios</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${turnosDia.map(turno => `
                            <tr>
                                <td>${turno.hora}</td>
                                <td>${turno.cliente}</td>
                                <td>$${turno.precio}</td>
                                <td>${turno.comentarios || '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div class="resumen">
                    <h3>Resumen del día</h3>
                    <div>Total de turnos: ${turnosDia.length}</div>
                    <div class="total-ingresos">
                        Total estimado: $${turnosDia.reduce((sum, turno) => sum + parseFloat(turno.precio || 0), 0).toLocaleString('es-AR')}
                    </div>
                </div>
            </body>
            </html>
        `;

        const ventanaImpresion = window.open('', '_blank');
        ventanaImpresion.document.open();
        ventanaImpresion.document.write(contenidoHTML);
        ventanaImpresion.document.close();

        ventanaImpresion.onload = () => {
            ventanaImpresion.focus();
            ventanaImpresion.print();
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

    // Si no hay profesional autenticado
    if (!profesional?.id_profesional) {
        return (
            <div id="turnos" className="turnos-container">
                <h2>Turnos</h2>
                <div className="error-message">
                    No se pudo identificar al profesional. Por favor, inicie sesión nuevamente.
                </div>
            </div>
        );
    }

    return (
        <div id="turnos" className="turnos-container">
            <h2>Mis Turnos</h2>

            {error && <div className="error-message">{error}</div>}

            {/* Mostrar información del servicio del profesional */}
            {servicioDelProfesional && (
                <div className="servicio-info-card" style={{
                    background: '#f8f9fa',
                    padding: '10px',
                    borderRadius: '5px',
                    marginBottom: '20px',
                    border: '1px solid #dee2e6'
                }}>
                    <strong>Mi servicio:</strong> {servicioDelProfesional.nombre} - <span style={{color: '#28a745', fontWeight: 'bold'}}>${servicioDelProfesional.precio}</span>
                </div>
            )}

            <div className="turnos-header-flex">
                <div className="btns-izquierda">
                    <button className="btn-agregar" onClick={handleAgregar} disabled={isLoading || !servicioDelProfesional}>
                        Agregar Turno
                    </button>

                    <div className="imprimir-turnos-section">
                        <div className="fecha-selector">
                            <label htmlFor="fechaImprimir">Fecha para imprimir:</label>
                            <input
                                type="date"
                                id="fechaImprimir"
                                value={fechaParaImprimir}
                                onChange={(e) => setFechaParaImprimir(e.target.value)}
                                min={getFechaHoy()}
                                className="input-fecha"
                            />
                        </div>
                        <button
                            className="btn-agregar"
                            onClick={handleImprimirTurnos}
                            disabled={isLoading || !fechaParaImprimir}
                        >
                            IMPRIMIR TURNOS
                        </button>
                    </div>
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

            {/* Mostrar información de filtros activos */}
            <div className="filtros-info">
                <p>Mostrando {turnosFiltrados.length} de {turnos.length} turnos</p>
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
                                <th>Precio</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {turnosFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: "center" }}>
                                        {turnos.length === 0 ? "No hay turnos disponibles" : "No hay turnos que coincidan con los filtros aplicados"}
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
                                        <td>${t.precio}</td>
                                        <td className={getEstadoClass(t.estado)}>{t.estado}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal para agregar turnos - SIMPLIFICADO */}
            <ModalForm
                isOpen={mostrarModal}
                onClose={() => setMostrarModal(false)}
                title="Agregar Turno"
                onSave={handleGuardar}
            >
                {/* Mostrar información del servicio */}
                {servicioDelProfesional && (
                    <div className="form-group" style={{
                        background: '#e8f5e8',
                        padding: '10px',
                        borderRadius: '5px',
                        marginBottom: '15px'
                    }}>
                        <strong>Servicio:</strong> {servicioDelProfesional.nombre}<br/>
                        <strong>Precio:</strong> <span style={{color: '#28a745', fontWeight: 'bold'}}>${servicioDelProfesional.precio}</span>
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="fecha">Fecha:</label>
                    <input
                        id="fecha"
                        type="date"
                        value={formulario.fecha}
                        onChange={e => setFormulario({ ...formulario, fecha: e.target.value })}
                        disabled={isLoading}
                        required
                        min={getFechaHoy()}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="hora">Hora:</label>
                    <select
                        id="hora"
                        value={formulario.hora}
                        onChange={(e) => setFormulario({ ...formulario, hora: e.target.value })}
                        disabled={isLoading}
                        required
                        className="border p-2 rounded w-full mb-4">
                        <option value="">Seleccione una hora</option>
                        {horasDisponibles.map((hora) => (
                            <option key={hora} value={hora}>{hora}</option>
                        ))}
                    </select>
                </div>

                <DropdownClientes
                    value={formulario.cliente_id}
                    onChange={handleClienteChange}
                />

                {/* Campo para comentarios */}
                <div className="form-group">
                    <label htmlFor="comentarios">Comentarios:</label>
                    <textarea
                        id="comentarios"
                        value={formulario.comentarios || ''}
                        onChange={e => setFormulario({ ...formulario, comentarios: e.target.value })}
                        placeholder="Agregar comentarios (opcional)"
                        rows="3"
                    />
                </div>
            </ModalForm>
        </div>
    );
};

export default ProfTurnosSection;