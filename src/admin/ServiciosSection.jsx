import React, { useState, useEffect } from "react";
import ModalForm from "./ModalForm.jsx";
import DropdownCategorias from "./dropDownCat.jsx";
import ServicioFilterComponent from "./ServiciosFilterComponent.jsx"; // Importamos el componente de filtro

const ServiciosSection = () => {
    const [servicios, setServicios] = useState([]);
    const [serviciosFiltrados, setServiciosFiltrados] = useState([]); // Estado para los servicios filtrados
    const [modo, setModo] = useState("crear");
    const [mostrarModal, setMostrarModal] = useState(false);
    const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
    const [formulario, setFormulario] = useState({
        nombre: "",
        categoria: "",
        tipo: "Individual",
        precio: "",
        descripcion: "",
    });
    const [categorias, setCategorias] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);

    const fetchServicios = async () => {
        try {
            setCargando(true);
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
            setServiciosFiltrados(data); // Inicialmente, mostramos todos los servicios
        } catch (error) {
            console.error("Error al cargar los servicios:", error);
            setError("No se pudieron cargar los servicios. Intenta nuevamente.");
        } finally {
            setCargando(false);
        }
    };
    
    // Función para obtener las categorías
    const fetchCategorias = async () => {
        try {
            const response = await fetch('https://spabackend-production-e093.up.railway.app/api/categoriasAdm');
            if (!response.ok) {
                throw new Error('Error al cargar las categorías');
            }
            const data = await response.json();
            console.log('Categorías cargadas:', data); // Debug para verificar
            setCategorias(data);
        } catch (error) {
            console.error("Error al cargar las categorías:", error);
            setError("No se pudieron cargar las categorías. Intenta nuevamente.");
        }
    };

    useEffect(() => {
        fetchServicios();
        fetchCategorias();
    }, []);

    // Función para manejar el cambio en los filtros
    const handleFilterChange = (filters) => {
        const { categoria, tipo, searchTerm } = filters;
        
        // Filtrar los servicios según los criterios
        let resultado = [...servicios];
        
        // Filtrar por categoría
        if (categoria) {
            // Encontrar el nombre de la categoría según el ID
            const categoriaSeleccionada = categorias.find(
                cat => cat.id_categoria.toString() === categoria.toString()
            );
            
            if (categoriaSeleccionada) {
                resultado = resultado.filter(
                    servicio => servicio.categoria === categoriaSeleccionada.nombre
                );
            }
        }
        
        // Filtrar por tipo
        if (tipo) {
            resultado = resultado.filter(
                servicio => servicio.tipo === tipo
            );
        }
        
        // Filtrar por término de búsqueda en el nombre
        if (searchTerm) {
            resultado = resultado.filter(
                servicio => servicio.nombre.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        setServiciosFiltrados(resultado);
    };

    const handleAgregar = () => {
        setModo("crear");
        setFormulario({
            nombre: "",
            categoria: "",
            tipo: "Individual",
            precio: "",
            descripcion: "",
        });
        setMostrarModal(true);
    };

    const handleEditar = () => {
        if (servicioSeleccionado) {
            setModo("editar");
            // Creamos una copia del servicio seleccionado sin incluir profesionales
            const { profesionales, ...servicioSinProfesionales } = servicioSeleccionado;
            setFormulario(servicioSinProfesionales);
            setMostrarModal(true);
        }
    };

    const handleEliminar = async () => {
        if (servicioSeleccionado && window.confirm("¿Eliminar este servicio?")) {
            try {
                setCargando(true);
                const response = await fetch(`https://spabackend-production-e093.up.railway.app/api/serviciosAdm/${servicioSeleccionado.id}`, {
                    method: 'DELETE',
                });
                
                if (!response.ok) {
                    throw new Error("Error al eliminar el servicio");
                }
                
                // Actualizar la lista de servicios con un pequeño retraso
                setTimeout(async () => {
                    await fetchServicios();
                }, 500);
                
                setServicioSeleccionado(null);
                alert("Servicio eliminado con éxito");
                
            } catch (error) {
                console.error("Error al eliminar el servicio:", error);
                alert("No se pudo eliminar el servicio. Intenta nuevamente.");
            } finally {
                setCargando(false);
            }
        }
    };

    const handleGuardar = async () => {
        try {
            setCargando(true);
            
            // Preparamos los datos para enviar al backend
            const datosParaEnviar = { ...formulario };
            
            // Si estamos en modo crear, necesitamos convertir el ID de categoría a nombre
            if (modo === "crear") {
                // Encontramos el nombre de la categoría según el ID seleccionado
                const categoriaSeleccionada = categorias.find(
                    cat => cat.id_categoria.toString() === formulario.categoria.toString()
                );
                
                if (categoriaSeleccionada) {
                    datosParaEnviar.categoria = categoriaSeleccionada.nombre;
                } else {
                    throw new Error("Categoría no válida");
                }
                
                // Llamada a la API para crear
                const response = await fetch("https://spabackend-production-e093.up.railway.app/api/serviciosAdm", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(datosParaEnviar),
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Error al crear el servicio");
                }
                
                // Verificamos la respuesta y mostramos mensaje de éxito
                const resultado = await response.json();
                console.log("Servicio creado:", resultado);
                
                // Actualizar la lista de servicios con un pequeño retraso
                // para dar tiempo a que la base de datos se actualice completamente
                setTimeout(async () => {
                    await fetchServicios();
                }, 500);
                
                alert("Servicio creado con éxito");
            } else {
                // Si estamos editando, también necesitamos manejar la categoría
                const categoriaSeleccionada = categorias.find(
                    cat => cat.id_categoria.toString() === formulario.categoria.toString()
                );
                
                if (categoriaSeleccionada) {
                    datosParaEnviar.categoria = categoriaSeleccionada.nombre;
                }
                
                // Actualizar el servicio en la base de datos
                const response = await fetch(`https://spabackend-production-e093.up.railway.app/api/serviciosAdm/${formulario.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(datosParaEnviar),
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Error al actualizar el servicio");
                }
                
                // Actualizar la lista de servicios con un pequeño retraso
                setTimeout(async () => {
                    await fetchServicios();
                }, 500);
                
                alert("Servicio actualizado con éxito");
            }
            
            setMostrarModal(false);
            setServicioSeleccionado(null);
            
        } catch (error) {
            console.error("Error al guardar el servicio:", error);
            alert(`No se pudo guardar el servicio: ${error.message}`);
        } finally {
            setCargando(false);
        }
    };

    // Función para manejar el cambio de categoría
    const handleCategoriaChange = (categoriaId) => {
        setFormulario({ ...formulario, categoria: categoriaId });
    };
    
    // Función para validar el formulario antes de enviarlo
    const validarFormulario = () => {
        if (!formulario.nombre.trim()) {
            alert("El nombre del servicio es obligatorio");
            return false;
        }
        if (!formulario.categoria) {
            alert("Debe seleccionar una categoría");
            return false;
        }
        if (!formulario.precio || isNaN(formulario.precio) || parseFloat(formulario.precio) <= 0) {
            alert("El precio debe ser un número mayor que cero");
            return false;
        }
        if (!formulario.descripcion.trim()) {
            alert("La descripción del servicio es obligatoria");
            return false;
        }
        return true;
    };

    return (
        <div id="servicios">
            <h2>Servicios</h2>

            <div className="servicios-header-flex">
                <div className="btns-izquierda">
                    <button className="btn-agregar" onClick={handleAgregar} disabled={cargando}>
                        Agregar Servicio
                    </button>
                </div>
                <div className="btns-derecha">
                    <ServicioFilterComponent
                        categorias={categorias}
                        onFilterChange={handleFilterChange}
                        title="Filtrar servicios"
                    />
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}
            {cargando && <div className="loading">Cargando...</div>}

            <table className="tabla">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Categoría</th>
                        <th>Tipo</th>
                        <th>Precio</th>
                        <th>Descripción</th>
                    </tr>
                </thead>
                <tbody>
                    {serviciosFiltrados.map(servicio => (
                        <tr
                            key={servicio.id}
                            onClick={() => setServicioSeleccionado(servicio)}
                            style={{
                                backgroundColor:
                                    servicioSeleccionado?.id === servicio.id ? "#f0f0f0" : "white",
                                cursor: "pointer",
                            }}
                        >
                            <td>{servicio.id}</td>
                            <td>{servicio.nombre}</td>
                            <td>{servicio.categoria}</td>
                            <td>{servicio.tipo}</td>
                            <td>${servicio.precio}</td>
                            <td>{servicio.descripción}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {serviciosFiltrados.length === 0 && !cargando && (
                <div className="no-results">No se encontraron servicios que coincidan con los filtros.</div>
            )}

            <div className="acciones-turno">
                <button
                    className="btn-editar"
                    disabled={!servicioSeleccionado || cargando}
                    onClick={handleEditar}
                >
                    Editar
                </button>
                <button
                    className="btn-eliminar"
                    disabled={!servicioSeleccionado || cargando}
                    onClick={handleEliminar}
                >
                    Eliminar
                </button>
            </div>

            <ModalForm 
                isOpen={mostrarModal} 
                onClose={() => setMostrarModal(false)} 
                title={`${modo === "crear" ? "Agregar" : "Editar"} Servicio`}
                onSave={() => {
                    if (validarFormulario()) {
                        handleGuardar();
                    }
                }}
            >
                <input
                    type="text"
                    placeholder="Nombre"
                    value={formulario.nombre}
                    onChange={e => setFormulario({ ...formulario, nombre: e.target.value })}
                />
                
                {/* Reemplazamos el input de categoría por el componente DropdownCategorias */}
                <DropdownCategorias 
                    value={formulario.categoria}
                    onChange={handleCategoriaChange}
                />
                
                <select
                    value={formulario.tipo}
                    onChange={e => setFormulario({ ...formulario, tipo: e.target.value })}
                >
                    <option value="Individual">Individual</option>
                    <option value="Grupal">Grupal</option>
                </select>
                <input
                    type="number"
                    placeholder="Precio"
                    value={formulario.precio}
                    onChange={e => setFormulario({ ...formulario, precio: e.target.value })}
                />
                <textarea
                    placeholder="Descripción"
                    value={formulario.descripcion}
                    onChange={e => setFormulario({ ...formulario, descripcion: e.target.value })}
                ></textarea>
            </ModalForm>
        </div>
    );
};

export default ServiciosSection;