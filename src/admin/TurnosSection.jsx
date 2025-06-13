import React, { useState, useEffect } from "react";
import ModalForm from "./ModalForm.jsx";
import DropdownCategorias from "./dropDownCat.jsx";
import DropdownServicios from "./dropDownServicios.jsx";
import DropdownClientes from "./DropdownClientes.jsx";
import DropdownProfesionalesPorServicio from "./DropdownProfesionalesPorServicio.jsx";
import FilterComponent from "./FilterComponent.jsx";

const TurnosSection = () => {
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
        servicio_id: "", // Añadido para mantener el ID separado del nombre
        profesional_id: "",
        profesional_nombre: "",
        cliente_id: "",
        cliente_nombre: "",
        precio: "",
        comentarios: "",
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
            const response = await fetch(`http://localhost:3001/api/serviciosAdm?_=${timestamp}`);

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
            const response = await fetch("http://localhost:3001/api/turnosAdmin");
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
            const response = await fetch("http://localhost:3001/api/categoriasAdm");
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

    // Función para manejar el cambio en el filtro - ACTUALIZADA
    const handleFilterChange = (filteredData) => {
        console.log("Datos filtrados recibidos:", filteredData);
        setTurnosFiltrados(filteredData);
    };

    const handleAgregar = () => {
        setModo("crear");
        const fechaHoy = new Date().toISOString().substring(0, 10); // Formato YYYY-MM-DD
        setFormulario({
            fecha: fechaHoy,
            hora: "",
            categoria: "",
            servicio: "",
            servicio_id: "", // Añadido para mantener el ID separado
            profesional_id: "",
            profesional_nombre: "",
            cliente_id: "",
            cliente_nombre: "",
            precio: "",
            comentarios: "",
        });
        setServicioIdSeleccionado(null); // Limpiar ID de servicio seleccionado
        setMostrarModal(true);
    };

    const handleEditar = () => {
        if (turnoSeleccionado) {
            setModo("editar");
            console.log("Editando turno:", turnoSeleccionado);

            // Buscar el ID del servicio para el turno seleccionado
            let servicioId = null;
            const servicioEncontrado = servicios.find(s => s.nombre === turnoSeleccionado.servicio);
            if (servicioEncontrado) {
                servicioId = servicioEncontrado.id;
            }

            setServicioIdSeleccionado(servicioId);

            // Asegurarse de que todos los campos críticos estén como strings para el formulario
            setFormulario({
                ...turnoSeleccionado,
                servicio_id: servicioId ? servicioId.toString() : "",
                cliente_id: turnoSeleccionado.cliente_id ? turnoSeleccionado.cliente_id.toString() : "",
                cliente_nombre: turnoSeleccionado.cliente || "",
                profesional_id: turnoSeleccionado.profesional_id ? turnoSeleccionado.profesional_id.toString() : "",
                profesional_nombre: turnoSeleccionado.profesional || "",
                comentarios: turnoSeleccionado.comentarios || "",
                precio: turnoSeleccionado.precio ? turnoSeleccionado.precio.toString() : "0"
            });

            setMostrarModal(true);
        }
    };

    const handleEliminar = async () => {
        if (turnoSeleccionado && window.confirm("¿Está seguro que desea cancelar este turno?")) {
            try {
                setIsLoading(true);
                setError(null);

                console.log(`Cancelando turno ID: ${turnoSeleccionado.id}`);

                const response = await fetch(
                    `http://localhost:3001/api/turnosAdmin/estado/${turnoSeleccionado.id}`,
                    {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ estado: 'Cancelado' }),
                    }
                );

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Error al cancelar el turno");
                }

                // Mostrar mensaje de éxito
                alert("Turno cancelado correctamente");

                // Recargar los turnos
                await fetchTurnos();

                // Limpiar la selección
                setTurnoSeleccionado(null);
            } catch (error) {
                console.error("Error al cancelar el turno:", error);
                setError(`No se pudo cancelar el turno: ${error.message}`);
                alert(`No se pudo cancelar el turno: ${error.message}`);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const validarFormulario = () => {
    // Validar que todos los campos estén completos
    const camposRequeridos = ['fecha', 'hora', 'servicio_id', 'profesional_id', 'cliente_id'];
    const camposFaltantes = camposRequeridos.filter(campo => !formulario[campo]);

    if (camposFaltantes.length > 0) {
        const mensajesCampos = {
            'fecha': 'Fecha',
            'hora': 'Hora',
            'servicio_id': 'Servicio',
            'profesional_id': 'Profesional',
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

    // NUEVA VALIDACIÓN: Verificar que la fecha no sea anterior a hoy
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

    const handleGuardar = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Validar el formulario
            validarFormulario();

            // Conversión explícita y segura de IDs a enteros
            const id_servicio = parseInt(formulario.servicio_id, 10);
            const id_cliente = parseInt(formulario.cliente_id, 10);
            const id_profesional = parseInt(formulario.profesional_id, 10);

            // Validaciones adicionales
            if (isNaN(id_servicio)) {
                throw new Error("El servicio seleccionado no es válido. Por favor seleccione un servicio válido.");
            }

            if (isNaN(id_cliente)) {
                throw new Error("El ID del cliente no es válido. Por favor seleccione un cliente válido.");
            }

            if (isNaN(id_profesional)) {
                throw new Error("El ID del profesional no es válido. Por favor seleccione un profesional válido.");
            }

            // Preparar los datos para enviar al backend
            const datosFormateados = {
                id_cliente,
                id_servicio,
                id_profesional,
                fecha: formulario.fecha,
                hora: formulario.hora,
                estado: formulario.estado || 'Solicitado',
                precio: parseFloat(formulario.precio) || 0,
                comentarios: formulario.comentarios || '',
                // Añadimos también los nombres para compatibilidad con el backend original
                profesional: formulario.profesional_nombre,
                cliente: formulario.cliente_nombre,
                servicio: formulario.servicio
            };

            console.log("Datos a enviar al backend:", datosFormateados);

            let response;

            if (modo === "crear") {
                // Crear nuevo turno
                response = await fetch('http://localhost:3001/api/turnosAdmin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datosFormateados)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Error al crear el turno");
                }

                alert("Turno creado correctamente");
            } else {
                // Editar turno existente
                const id = parseInt(formulario.id, 10);
                if (isNaN(id)) {
                    throw new Error("ID de turno inválido");
                }

                console.log(`Actualizando turno ID: ${id}`, datosFormateados);

                const datosActualizados = {
                    ...datosFormateados,
                    id
                };

                response = await fetch(`http://localhost:3001/api/turnosAdmin/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datosActualizados)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Error al actualizar el turno");
                }

                alert("Turno actualizado correctamente");
            }

            // Recargar los turnos
            await fetchTurnos();

            // Cerrar el modal y limpiar la selección
            setMostrarModal(false);
            setTurnoSeleccionado(null);

        } catch (error) {
            console.error("Error al guardar el turno:", error);
            setError(`Error al guardar el turno: ${error.message}`);
            alert(`Error al guardar el turno: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCategoriaChange = (categoriaId) => {
        setFormulario({
            ...formulario,
            categoria: categoriaId,
            servicio: "", // Resetear servicio al cambiar categoría
            servicio_id: "", // Resetear ID del servicio
            profesional_id: "", // Resetear profesional al cambiar categoría
            profesional_nombre: ""
        });
        setServicioIdSeleccionado(null); // Resetear ID de servicio
    }

    const handleServicioChange = (servicioId, servicioNombre) => {
        console.log("Servicio seleccionado - ID:", servicioId, "Nombre:", servicioNombre);

        // Verificamos si el servicioId es un número o una cadena que representa un número
        let idServicio = null;

        if (servicioId && !isNaN(parseInt(servicioId, 10))) {
            idServicio = parseInt(servicioId, 10);

            // Encontrar el servicio completo para obtener el precio
            const servicioEncontrado = servicios.find(s => s.id == idServicio);

            if (servicioEncontrado) {
                setServicioIdSeleccionado(idServicio);

                // Actualizar el servicio y resetear profesional
                setFormulario({
                    ...formulario,
                    servicio: servicioNombre || servicioEncontrado.nombre,
                    servicio_id: idServicio.toString(),
                    profesional_id: "",
                    profesional_nombre: "",
                    precio: servicioEncontrado.precio // Actualizar el precio automáticamente
                });

                console.log("Servicio encontrado con precio:", servicioEncontrado.precio);
                console.log("ID de servicio seleccionado:", idServicio);
            } else {
                console.log("No se encontró el servicio con ID", idServicio, "en la lista");
                handleServicioNotFound(servicioId, servicioNombre);
            }
        } else {
            // Si servicioId no es un número, asumimos que es el nombre del servicio
            handleServicioNotFound(servicioId, servicioNombre);
        }
    }

    // Función auxiliar para manejar el caso cuando no se encuentra el servicio por ID
    const handleServicioNotFound = (servicioId, servicioNombre) => {
        // Intentamos buscar por nombre si tenemos el nombre
        if (servicioNombre) {
            const servicioEncontrado = servicios.find(s => s.nombre === servicioNombre);

            if (servicioEncontrado) {
                setServicioIdSeleccionado(parseInt(servicioEncontrado.id, 10));

                setFormulario({
                    ...formulario,
                    servicio: servicioNombre,
                    servicio_id: servicioEncontrado.id.toString(),
                    profesional_id: "",
                    profesional_nombre: "",
                    precio: servicioEncontrado.precio
                });

                console.log("Servicio encontrado por nombre:", servicioEncontrado.id);
            } else {
                console.log("No se encontró el servicio por nombre:", servicioNombre);
                setServicioIdSeleccionado(null);

                setFormulario({
                    ...formulario,
                    servicio: servicioNombre,
                    servicio_id: "",
                    profesional_id: "",
                    profesional_nombre: "",
                    precio: ""
                });
            }
        } else {
            // No tenemos suficiente información para identificar el servicio
            console.log("Información insuficiente para identificar el servicio");
            setServicioIdSeleccionado(null);

            setFormulario({
                ...formulario,
                servicio: servicioId || "", // Usamos lo que tengamos como nombre
                servicio_id: "",
                profesional_id: "",
                profesional_nombre: "",
                precio: ""
            });
        }
    }

    const handleClienteChange = (clienteId, nombreCompleto) => {
        // Aseguramos que el clienteId se almacena correctamente
        console.log("Cliente seleccionado - ID:", clienteId, "Nombre:", nombreCompleto);

        setFormulario({
            ...formulario,
            cliente_id: clienteId,
            cliente_nombre: nombreCompleto
        });
    }

    const handleProfesionalChange = (profesionalId, profesionalNombre) => {
        console.log("Profesional seleccionado - ID:", profesionalId, "Nombre:", profesionalNombre || "No disponible");

        setFormulario({
            ...formulario,
            profesional_id: profesionalId,
            profesional_nombre: profesionalNombre || formulario.profesional_nombre
        });
    }

    const handleGenerarReporte = () => {
        alert("Generando reporte de turnos...");
        // Implementación del reporte de turnos (pendiente)
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
                        Agregar Turno
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
                        showServiceFilter={true} 
                        availableStatuses={estadosTurnos}
                        apiUrl="http://localhost:3001/api/serviciosAdm"
                    />
                </div>
            </div>

            {/* AGREGADO: Mostrar información de filtros activos */}
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
                                <th>Profesional</th>
                                <th>Cliente</th>
                                <th>Servicio</th>
                                <th>Precio</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {turnosFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: "center" }}>
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
                                        <td>{t.profesional}</td>
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

            <div className="acciones-turno">
                <button
                    className="btn-editar"
                    disabled={!turnoSeleccionado || isLoading}
                    onClick={handleEditar}
                >
                    Editar
                </button>
                <button
                    className="btn-eliminar"
                    disabled={!turnoSeleccionado || isLoading || turnoSeleccionado?.estado === 'Cancelado'}
                    onClick={handleEliminar}
                >
                    Cancelar Turno
                </button>
            </div>

            <ModalForm
                isOpen={mostrarModal}
                onClose={() => setMostrarModal(false)}
                title={`${modo === "crear" ? "Agregar" : "Editar"} Turno`}
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
                    value={formulario.servicio}
                    onChange={(servicioId, servicioNombre) => handleServicioChange(servicioId, servicioNombre)}
                />

                {/* Implementación del DropdownProfesionalesPorServicio con debug */}
                {formulario.servicio_id ? (
                    <>
                        <DropdownProfesionalesPorServicio
                            idServicio={formulario.servicio_id}
                            value={formulario.profesional_id}
                            onChange={(profesionalId, profesionalNombre) => {
                                handleProfesionalChange(profesionalId, profesionalNombre);
                            }}
                        />
                    </>
                ) : (
                    formulario.servicio && (
                        <div className="form-group">
                            <label>Profesional:</label>
                            <p className="error-text">Por favor seleccione un servicio válido primero</p>
                        </div>
                    )
                )}

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

export default TurnosSection;