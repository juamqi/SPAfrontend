import React, { useEffect, useState } from "react";
import ModalForm from "./ModalForm.jsx";
import DropdownCategorias from "./dropDownCat";
import DropdownServicios from "./dropDownServicios.jsx";
import ProfesionalFilterComponent from "./ProfesionalFilterComponent";

const ProfesionalesSection = () => {
    const [profesionales, setProfesionales] = useState([]);
    const [profesionalesFiltrados, setProfesionalesFiltrados] = useState([]);
    const [modo, setModo] = useState("crear");
    const [mostrarModal, setMostrarModal] = useState(false);
    const [serviciosActuales, setServiciosActuales] = useState([]);
    const [profesionalSeleccionado, setProfesionalSeleccionado] = useState(null);
    const [formulario, setFormulario] = useState({
        nombre: "",
        apellido: "",
        categoria: "",
        servicio: "",
        nombreServicio: "", // Nuevo campo para almacenar el nombre del servicio
        activo: "1",
        email: "",
        telefono: "",
        password: "", // Campo para la contraseña
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // Mapa para mantener la relación entre IDs de servicios y sus nombres para mostrar en la tabla
    const [nombresServicios, setNombresServicios] = useState({});
    // Estado para los filtros aplicados
    const [filtros, setFiltros] = useState({
        nombre: "",
        apellido: ""
    });

    useEffect(() => {
        const fetchProfesionales = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch("http://localhost:3001/api/profesionalesAdm");
                if (!response.ok) {
                    throw new Error("Error al obtener los profesionales");
                }
                const data = await response.json();
                setProfesionales(data);
                setProfesionalesFiltrados(data); // Inicialmente mostramos todos los profesionales
            } catch (error) {
                console.error("Error al cargar los profesionales:", error);
                setError("No se pudieron cargar los profesionales. Intenta nuevamente.");
            } finally {
                setLoading(false);
            }
        };

        // Esta función obtiene todos los servicios disponibles para tener un mapeo de ID a nombre
        const fetchAllServicios = async () => {
            try {
                const response = await fetch("http://localhost:3001/api/serviciosAdm");
                if (!response.ok) {
                    throw new Error("Error al obtener los servicios");
                }
                const servicios = await response.json();

                // Creamos un mapa que nos permita convertir de ID a nombre de servicio
                const nombresMap = {};
                servicios.forEach(servicio => {
                    nombresMap[servicio.id_servicio] = servicio.nombre;
                });
                setNombresServicios(nombresMap);
            } catch (error) {
                console.error("Error al cargar los servicios:", error);
            }
        };

        fetchProfesionales();
        fetchAllServicios();
    }, []);

    // Efecto para aplicar filtros cuando cambian
    useEffect(() => {
        aplicarFiltros();
    }, [filtros, profesionales]);

    // Función para aplicar los filtros a la lista de profesionales
    const aplicarFiltros = () => {
        const { nombre, apellido } = filtros;

        const profesionalesFiltrados = profesionales.filter(profesional => {
            const nombreCoincide = !nombre || profesional.nombre.toLowerCase().includes(nombre.toLowerCase());
            const apellidoCoincide = !apellido || profesional.apellido.toLowerCase().includes(apellido.toLowerCase());

            return nombreCoincide && apellidoCoincide;
        });

        setProfesionalesFiltrados(profesionalesFiltrados);
    };

    // Manejador para el cambio de filtros desde el componente ProfesionalFilterComponent
    const handleFilterChange = (nuevosFiltros) => {
        setFiltros(nuevosFiltros);
    };

    const actualizarProfesional = async (profesionalEditado) => {
        try {
            // Modificación principal: Enviar el nombre del servicio en lugar del ID
            // Obtener el nombre del servicio del mapa o de la propiedad nombreServicio
            let nombreServicio = profesionalEditado.nombreServicio;

            if (!nombreServicio) {
                // Buscar en los servicios actuales
                const servicioEncontrado = serviciosActuales.find(s => s.id_servicio == profesionalEditado.servicio);
                if (servicioEncontrado) {
                    nombreServicio = servicioEncontrado.nombre;
                } else {
                    // Buscar en el mapa global
                    nombreServicio = nombresServicios[profesionalEditado.servicio];
                }
            }

            if (!nombreServicio) {
                throw new Error('No se pudo determinar el nombre del servicio');
            }

            const dataToSend = {
                nombre: profesionalEditado.nombre,
                apellido: profesionalEditado.apellido,
                servicio: nombreServicio, // Enviar el nombre del servicio, no el ID
                activo: profesionalEditado.activo,
                email: profesionalEditado.email,
                telefono: profesionalEditado.telefono
            };

            // Solo agregar la contraseña si se proporcionó una nueva
            if (profesionalEditado.password && profesionalEditado.password.trim() !== "") {
                dataToSend.password = profesionalEditado.password;
            }

            console.log("Datos para actualizar profesional:", dataToSend);

            const response = await fetch(`http://localhost:3001/api/profesionalesAdm/${profesionalEditado.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al actualizar el profesional');
            }

            return await response.json();
        } catch (error) {
            console.error('Error al actualizar el profesional:', error);
            throw error;
        }
    };

    const crearProfesional = async (nuevoProfesional) => {
        try {
            console.log("Datos recibidos para crear profesional:", nuevoProfesional);

            // Verificar que se haya seleccionado un servicio (ID)
            if (!nuevoProfesional.servicio) {
                throw new Error('Servicio no válido o no encontrado');
            }

            // El DropdownServicios ya está devolviendo el ID del servicio directamente
            // así que no necesitamos hacer una conversión de nombre a ID
            const dataToSend = {
                nombre: nuevoProfesional.nombre,
                apellido: nuevoProfesional.apellido,
                id_servicio: nuevoProfesional.servicio, // Este ya es el ID del servicio
                email: nuevoProfesional.email,
                telefono: nuevoProfesional.telefono,
                password: nuevoProfesional.password // Agregar la contraseña
            };

            console.log("Datos a enviar para crear profesional:", dataToSend);

            const response = await fetch("http://localhost:3001/api/profesionalesAdm", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al crear el profesional');
            }

            return await response.json();
        } catch (error) {
            console.error('Error al crear el profesional:', error);
            throw error;
        }
    };

    const eliminarProfesional = async (id) => {
        try {
            const response = await fetch(`http://localhost:3001/api/profesionalesAdm/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al eliminar el profesional');
            }

            return await response.json();
        } catch (error) {
            console.error('Error al eliminar el profesional:', error);
            throw error;
        }
    };

    const handleAgregar = () => {
        setModo("crear");
        setFormulario({
            nombre: "",
            apellido: "",
            categoria: "",
            servicio: "",
            nombreServicio: "",
            activo: "1",
            email: "",
            telefono: "",
            password: "",
        });
        setMostrarModal(true);
    };

    const handleEditar = () => {
        if (profesionalSeleccionado) {
            setModo("editar");
            setFormulario({ 
                ...profesionalSeleccionado,
                password: "" // Limpiar el campo de contraseña al editar
            });
            setMostrarModal(true);
        }
    };

    const handleGuardar = async () => {
        try {
            setLoading(true);
            setError(null);

            // Validación básica
            if (!formulario.nombre || !formulario.apellido || !formulario.servicio || !formulario.email || !formulario.telefono) {
                setError("Todos los campos son obligatorios");
                setLoading(false);
                return;
            }

            // Validar contraseña solo al crear, al editar es opcional
            if (modo === "crear" && (!formulario.password || formulario.password.trim() === "")) {
                setError("La contraseña es obligatoria al crear un profesional");
                setLoading(false);
                return;
            }

            console.log("Intentando guardar profesional:", formulario);

            if (modo === "crear") {
                // Lógica para crear un nuevo profesional
                const resultado = await crearProfesional(formulario);
                console.log("Resultado API:", resultado);

                // Obtener los datos del nuevo profesional
                const nuevoProfesional = resultado.profesional;

                // Determinar el nombre del servicio para mostrar
                // Prioridad: 1) nombre guardado en el formulario, 2) buscar en servicios actuales, 3) mapa global
                const idServicio = nuevoProfesional.id_servicio || formulario.servicio;

                // Intentamos todas las formas posibles de obtener el nombre del servicio
                let nombreServicio = formulario.nombreServicio;

                if (!nombreServicio) {
                    // Buscar en los servicios actuales
                    const servicioEncontrado = serviciosActuales.find(s => s.id_servicio == idServicio);
                    if (servicioEncontrado) {
                        nombreServicio = servicioEncontrado.nombre;
                    } else {
                        // Buscar en el mapa global
                        nombreServicio = nombresServicios[idServicio];
                    }
                }

                // Si todo falla, usamos el ID como último recurso
                if (!nombreServicio) {
                    nombreServicio = idServicio;
                }

                // Crear el objeto del profesional para la tabla
                const profesionalParaTabla = {
                    id: nuevoProfesional.id_profesional,
                    nombre: nuevoProfesional.nombre,
                    apellido: nuevoProfesional.apellido,
                    servicio: nombreServicio,  // Usar el nombre que encontramos
                    activo: nuevoProfesional.activo,
                    email: nuevoProfesional.email,
                    telefono: nuevoProfesional.telefono
                };

                console.log("Profesional para añadir a la tabla:", profesionalParaTabla);

                // Actualizar la lista de profesionales
                setProfesionales([...profesionales, profesionalParaTabla]);

                alert("Profesional creado correctamente");
            } else {
                // Lógica para editar un profesional existente
                await actualizarProfesional(formulario);

                // Conseguir el nombre del servicio para mostrar en la tabla
                // Usar la misma lógica que al crear, pero adaptada para edición
                const idServicio = formulario.servicio;
                let nombreServicio = formulario.nombreServicio;

                if (!nombreServicio) {
                    // Buscar en los servicios actuales
                    const servicioEncontrado = serviciosActuales.find(s => s.id_servicio == idServicio);
                    if (servicioEncontrado) {
                        nombreServicio = servicioEncontrado.nombre;
                    } else {
                        // Buscar en el mapa global
                        nombreServicio = nombresServicios[idServicio];
                    }

                    // Si todo falla, usar el ID
                    if (!nombreServicio) {
                        nombreServicio = idServicio;
                    }
                }

                // Actualizar la lista de profesionales localmente
                setProfesionales(profesionales.map(p => {
                    if (p.id === formulario.id) {
                        return {
                            ...formulario,
                            servicio: nombreServicio
                        };
                    }
                    return p;
                }));

                alert("Profesional actualizado correctamente");
            }

            setMostrarModal(false);
            setProfesionalSeleccionado(null);
        } catch (error) {
            console.error("Error al guardar:", error);
            setError("Error al guardar los cambios: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEliminar = async () => {
        if (!profesionalSeleccionado) return;

        if (window.confirm("¿Estás seguro de querer eliminar a este profesional?")) {
            try {
                setLoading(true);
                await eliminarProfesional(profesionalSeleccionado.id);

                // Remover el profesional de la lista mostrada en UI
                setProfesionales(profesionales.filter(p => p.id !== profesionalSeleccionado.id));

                setProfesionalSeleccionado(null);
                alert("Profesional eliminado correctamente");
            } catch (error) {
                setError("Error al eliminar el profesional: " + error.message);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleCancelar = () => {
        setMostrarModal(false);
        setError(null);
    };

    return (
        <div id="profesionales">
            <h2>Profesionales</h2>
            <div className="profesionales-header-flex">
                <div className="btns-izquierda">
                    <button className="btn-agregar" onClick={handleAgregar} disabled={loading}>
                        Agregar Profesional
                    </button>
                </div>
                <div className="btns-derecha">
                    <ProfesionalFilterComponent
                        onFilterChange={handleFilterChange}
                        title="Filtrar profesionales"
                    />
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            {loading ? (
                <div className="loading">Cargando...</div>
            ) : (
                <table className="tabla">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th>Servicios</th>
                            <th>Email</th>
                            <th>Teléfono</th>
                        </tr>
                    </thead>
                    <tbody>
                        {profesionalesFiltrados.length > 0 ? (
                            profesionalesFiltrados.map(p => (
                                <tr
                                    key={p.id}
                                    onClick={() => setProfesionalSeleccionado(p)}
                                    style={{
                                        backgroundColor: profesionalSeleccionado?.id === p.id ? "#f0f0f0" : "white",
                                        cursor: "pointer",
                                    }}
                                >
                                    <td>{p.id}</td>
                                    <td>{p.nombre}</td>
                                    <td>{p.apellido}</td>
                                    <td>{p.servicio}</td>
                                    <td>{p.email}</td>
                                    <td>{p.telefono}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="no-resultados">No se encontraron profesionales con los filtros aplicados</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}

            <div className="acciones-turno">
                <button className="btn-editar" disabled={!profesionalSeleccionado || loading} onClick={handleEditar}>
                    Editar
                </button>
                <button className="btn-eliminar" disabled={!profesionalSeleccionado || loading} onClick={handleEliminar}>
                    Eliminar
                </button>
            </div>

            <ModalForm
                isOpen={mostrarModal}
                onClose={handleCancelar}
                title={`${modo === "crear" ? "Agregar" : "Editar"} Profesional`}
                onSave={handleGuardar}
            >
                {error && <div className="error-message-modal">{error}</div>}
                {loading && <div className="loading-message">Procesando...</div>}

                <input
                    type="text"
                    placeholder="Nombre"
                    value={formulario.nombre}
                    onChange={e => setFormulario({ ...formulario, nombre: e.target.value })}
                    required
                />
                <input
                    type="text"
                    placeholder="Apellido"
                    value={formulario.apellido}
                    onChange={e => setFormulario({ ...formulario, apellido: e.target.value })}
                    required
                />
                <DropdownCategorias
                    value={formulario.categoria}
                    onChange={(valor) => setFormulario({ ...formulario, categoria: valor, servicio: "" })}
                    required
                />
                <DropdownServicios
                    categoriaId={formulario.categoria}
                    value={formulario.servicio}
                    onChange={(valor, nombreServicio) => {
                        setFormulario({
                            ...formulario,
                            servicio: valor,
                            nombreServicio: nombreServicio  // Guardamos también el nombre
                        });
                    }}
                    onServiciosLoaded={setServiciosActuales}  // Guardamos la lista completa de servicios
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={formulario.email}
                    onChange={e => setFormulario({ ...formulario, email: e.target.value })}
                    required
                />
                <input
                    type="tel"
                    placeholder="Teléfono"
                    value={formulario.telefono}
                    onChange={e => setFormulario({ ...formulario, telefono: e.target.value })}
                    required
                />
                <input
                    type="password"
                    placeholder={modo === "crear" ? "Contraseña" : "Nueva contraseña (opcional)"}
                    value={formulario.password}
                    onChange={e => setFormulario({ ...formulario, password: e.target.value })}
                    required={modo === "crear"}
                />
                {modo === "editar" && (
                    <small style={{ color: "#666", fontSize: "12px", marginTop: "-10px", display: "block" }}>
                        Deja en blanco si no quieres cambiar la contraseña
                    </small>
                )}
            </ModalForm>
        </div>
    );
};

export default ProfesionalesSection;