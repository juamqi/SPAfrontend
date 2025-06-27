import React, { useState, useEffect } from "react";
import ModalForm from "./ModalForm.jsx";
import DropdownCategorias from "./dropDownCat.jsx";
import DropdownServicios from "./dropDownServicios.jsx";
import DropdownClientes from "./DropdownClientes.jsx";
import FilterComponent from "./FilterComponent.jsx";
import { usePopupContext } from "../componentes/popupcontext.jsx";

const ProfTurnosSection = () => {
    const profesional = JSON.parse(localStorage.getItem("profesional"));
    const profesionalId = profesional?.id_profesional;
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
        precio: "",
        comentarios: "",
    });
    const [categorias, setCategorias] = useState([]);
    const horasDisponibles = Array.from({ length: 14 }, (_, i) => `${(8 + i).toString().padStart(2, '0')}:00`);
    const { showPopup } = usePopupContext();
    const [fechaSeleccionada, setFechaSeleccionada] = useState("");
    const [fechaParaImprimir, setFechaParaImprimir] = useState("");

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

            // Obtener el nombre del profesional desde localStorage
            const nombreProfesional = profesional?.nombre;

            console.log("Nombre del profesional logueado:", nombreProfesional);
            console.log("Todos los nombres de profesionales en turnos:", [...new Set(data.map(t => t.profesional))]);

            // Filtrar turnos del profesional logueado por NOMBRE
            const turnosDelProfesional = data.filter(t =>
                t.profesional === nombreProfesional
            );

            console.log("Turnos filtrados del profesional:", turnosDelProfesional);
            console.log("Cantidad de turnos encontrados:", turnosDelProfesional.length);

            setTurnos(turnosDelProfesional);
            setTurnosFiltrados(turnosDelProfesional);
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

        // Establecer la fecha de mañana como valor por defecto
        const mañana = new Date();
        mañana.setDate(mañana.getDate() + 1);
        setFechaParaImprimir(mañana.toISOString().split('T')[0]);
    }, []);

    // Función para manejar el cambio en el filtro
    const handleFilterChange = (filteredData) => {
        setTurnosFiltrados(filteredData);
    };

    // Función para obtener la fecha de mañana en formato YYYY-MM-DD
    const getFechaMañana = () => {
    const mañana = new Date();
    mañana.setDate(mañana.getDate() + 1);
    return mañana.toLocaleDateString('en-CA'); // YYYY-MM-DD local
};

    // Función para obtener la fecha de hoy en formato YYYY-MM-DD
    const getFechaHoy = () => {
        return new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD en zona local
    };

    // NUEVA FUNCIONALIDAD: Agregar turno
    const handleAgregar = () => {
        setModo("crear");
        const fechaHoy = new Date().toLocaleDateString('en-CA');
        setFormulario({
            fecha: fechaHoy,
            hora: "",
            categoria: "",
            servicio: "",
            servicio_id: "",
            cliente_id: "",
            cliente_nombre: "",
            precio: "",
            comentarios: "",
        });
        setServicioIdSeleccionado(null);
        setMostrarModal(true);
    };

    // NUEVA FUNCIONALIDAD: Validar formulario
    const validarFormulario = () => {
        const camposRequeridos = ['fecha', 'hora', 'servicio_id', 'cliente_id'];
        const camposFaltantes = camposRequeridos.filter(campo => !formulario[campo]);

        if (camposFaltantes.length > 0) {
            const mensajesCampos = {
                'fecha': 'Fecha',
                'hora': 'Hora',
                'servicio_id': 'Servicio',
                'cliente_id': 'Cliente'
            };

            const camposFaltantesNombres = camposFaltantes.map(campo => mensajesCampos[campo]);
            throw new Error(`Por favor complete todos los campos obligatorios: ${camposFaltantesNombres.join(', ')}`);
        }

        // Validar formato de fecha
        const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!fechaRegex.test(formulario.fecha)) {
            throw new Error("El formato de fecha no es válido. Utilice YYYY-MM-DD");
        }

        // Verificar que la fecha no sea anterior a hoy
        const fechaSeleccionada = new Date(formulario.fecha);
        const fechaHoy = new Date();

        // Establecer la hora a 00:00:00 para comparar solo las fechas
        fechaHoy.setHours(0, 0, 0, 0);
        fechaSeleccionada.setHours(0, 0, 0, 0);

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

    // NUEVA FUNCIONALIDAD: Guardar turno
    const handleGuardar = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Validar el formulario
            validarFormulario();

            // Conversión explícita y segura de IDs a enteros
            const id_servicio = parseInt(formulario.servicio_id, 10);
            const id_cliente = parseInt(formulario.cliente_id, 10);
            const id_profesional = parseInt(profesionalId, 10); // Usar el ID del profesional logueado

            // Validaciones adicionales
            if (isNaN(id_servicio)) {
                throw new Error("El servicio seleccionado no es válido. Por favor seleccione un servicio válido.");
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
                id_profesional, // Usar el ID del profesional logueado
                fecha: formulario.fecha,
                hora: formulario.hora,
                estado: 'Solicitado',
                precio: parseFloat(formulario.precio) || 0,
                comentarios: formulario.comentarios || '',
                // Añadimos también los nombres para compatibilidad con el backend original
                profesional: profesional?.nombre,
                cliente: formulario.cliente_nombre,
                servicio: formulario.servicio
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

            // Cerrar el modal y limpiar la selección
            setMostrarModal(false);
            setTurnoSeleccionado(null);

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

    // NUEVA FUNCIONALIDAD: Manejo de categoría
    const handleCategoriaChange = (categoriaId) => {
        setFormulario({
            ...formulario,
            categoria: categoriaId,
            servicio: "",
            servicio_id: "",
            precio: "",
        });
        setServicioIdSeleccionado(null);
    }

    // NUEVA FUNCIONALIDAD: Manejo de servicio
    const handleServicioChange = (servicioId, servicioNombre) => {
        console.log("Servicio seleccionado - ID:", servicioId, "Nombre:", servicioNombre);

        let idServicio = null;

        if (servicioId && !isNaN(parseInt(servicioId, 10))) {
            idServicio = parseInt(servicioId, 10);

            // Encontrar el servicio completo para obtener el precio
            const servicioEncontrado = servicios.find(s => s.id == idServicio);

            if (servicioEncontrado) {
                setServicioIdSeleccionado(idServicio);

                setFormulario({
                    ...formulario,
                    servicio: servicioNombre || servicioEncontrado.nombre,
                    servicio_id: idServicio.toString(),
                    precio: servicioEncontrado.precio
                });

                console.log("Servicio encontrado con precio:", servicioEncontrado.precio);
            } else {
                console.log("No se encontró el servicio con ID", idServicio);
                handleServicioNotFound(servicioId, servicioNombre);
            }
        } else {
            handleServicioNotFound(servicioId, servicioNombre);
        }
    }

    // Función auxiliar para manejar el caso cuando no se encuentra el servicio por ID
    const handleServicioNotFound = (servicioId, servicioNombre) => {
        if (servicioNombre) {
            const servicioEncontrado = servicios.find(s => s.nombre === servicioNombre);

            if (servicioEncontrado) {
                setServicioIdSeleccionado(parseInt(servicioEncontrado.id, 10));

                setFormulario({
                    ...formulario,
                    servicio: servicioNombre,
                    servicio_id: servicioEncontrado.id.toString(),
                    precio: servicioEncontrado.precio
                });
            } else {
                setServicioIdSeleccionado(null);
                setFormulario({
                    ...formulario,
                    servicio: servicioNombre,
                    servicio_id: "",
                    precio: ""
                });
            }
        } else {
            setServicioIdSeleccionado(null);
            setFormulario({
                ...formulario,
                servicio: servicioId || "",
                servicio_id: "",
                precio: ""
            });
        }
    }

    // NUEVA FUNCIONALIDAD: Manejo de cliente
    const handleClienteChange = (clienteId, nombreCompleto) => {
        console.log("Cliente seleccionado - ID:", clienteId, "Nombre:", nombreCompleto);

        setFormulario({
            ...formulario,
            cliente_id: clienteId,
            cliente_nombre: nombreCompleto
        });
    }

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

        // Usar el mismo filtro que en fetchTurnos - por nombre del profesional
        const nombreProfesional = profesional?.nombre;

        const turnosDia = turnos.filter(turno => {
            const fechaTurno = turno.fecha.split('T')[0];
            const esFechaCorrecta = fechaTurno === fechaParaImprimir;
            const esEstadoCorrecto = turno.estado === 'Solicitado';

            // Probar ambos métodos de identificación del profesional
            const esProfesionalCorrecto =
                turno.profesional === nombreProfesional ||
                Number(turno.id_profesional) === Number(profesionalId) ||
                String(turno.id_profesional) === String(profesionalId);

            return esFechaCorrecta && esEstadoCorrecto && esProfesionalCorrecto;
        });

        console.log("Fecha seleccionada:", fechaParaImprimir);
        console.log("Nombre profesional:", nombreProfesional);
        console.log("ID profesional:", profesionalId);
        console.log("Turnos filtrados para impresión:", turnosDia);

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
                    .fecha-titulo { text-align: center; margin-bottom: 30px; font-size: 14px; color: #666; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                    th { background-color: #f2f2f2; font-weight: bold; }
                    tr:nth-child(even) { background-color: #f9f9f9; }
                    .total-turnos { margin-top: 20px; text-align: right; font-weight: bold; font-size: 14px; }
                    .resumen { margin-top: 30px; padding: 15px; background-color: #f8f9fa; border-radius: 5px; }
                    .resumen h3 { margin-top: 0; color: #495057; }
                    .total-ingresos { color: #28a745; font-weight: bold; }
                </style>
            </head>
            <body>
                <h1>TURNOS PROGRAMADOS</h1>
                <div class="profesional-info">Profesional: ${profesional?.nombre || 'N/A'}</div>
                <div class="fecha-titulo">
                    Fecha: ${fechaFormateada}
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Hora</th>
                            <th>Cliente</th>
                            <th>Servicio</th>
                            <th>Precio</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${turnosDia.map(turno => `
                            <tr>
                                <td>${turno.hora}</td>
                                <td>${turno.cliente}</td>
                                <td>${turno.servicio}</td>
                                <td>$${turno.precio}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div class="resumen">
                    <h3>Resumen del día</h3>
                    <div class="total-turnos">Total de turnos: ${turnosDia.length}</div>
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

    return (
        <div id="turnos" className="turnos-container">
            <h2>Turnos</h2>

            {error && <div className="error-message">{error}</div>}

            <div className="turnos-header-flex">
                <div className="btns-izquierda">
                    {/* NUEVO: Botón para agregar turno */}
                    <button className="btn-agregar" onClick={handleAgregar} disabled={isLoading}>
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

            {/* NUEVO: Modal para agregar turnos */}
            <ModalForm
                isOpen={mostrarModal}
                onClose={() => setMostrarModal(false)}
                title="Agregar Turno"
                onSave={handleGuardar}
            >
                <div className="form-group">
                    <label htmlFor="fecha">Fecha:</label>
                    <input
    id="fecha"
    type="date"
    value={formulario.fecha}
    onChange={e => setFormulario({ ...formulario, fecha: e.target.value })}
    disabled={isLoading}
    required
    min={getFechaHoy()} // 🔒 Esto impide seleccionar días pasados, pero permite hoy
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

                <DropdownCategorias
                    value={formulario.categoria}
                    onChange={handleCategoriaChange}
                />

                <DropdownServicios
                    categoriaId={formulario.categoria}
                    value={formulario.servicio_id}
                    onChange={(servicioId, servicioNombre) => handleServicioChange(servicioId, servicioNombre)}
                />

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

                {/* Mostrar precio del servicio seleccionado */}
                {formulario.precio && (
                    <div className="form-group">
                        <label>Precio del servicio:</label>
                        <p style={{ fontWeight: 'bold', color: '#28a745' }}>${formulario.precio}</p>
                    </div>
                )}
            </ModalForm>
        </div>
    );
};

export default ProfTurnosSection;