import React, { useEffect, useState } from "react";
import ModalForm from "./ModalForm.jsx";
import ClienteFilterComponent from "./ClienteFilterComponent.jsx";
import { usePopupContext } from "../componentes/popupcontext.jsx";

const ClientesSection = () => {
    const [clientes, setClientes] = useState([]);
    const [modo, setModo] = useState("crear");
    const [mostrarModal, setMostrarModal] = useState(false);
    const { showPopup } = usePopupContext();
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

    const clientesFiltrados = clientes.filter(cliente =>
        `${cliente.nombre} ${cliente.apellido} ${cliente.email}`.toLowerCase().includes(filtroTexto.toLowerCase())
    );


    useEffect(() => {
        const fetchClientes = async () => {
            try {
                setLoading(true);
                const response = await fetch("https://spabackend-production-e093.up.railway.app/api/clientesAdm");
                if (!response.ok) throw new Error("Error al obtener los clientes");

                const data = await response.json();
                const clientesConId = data.map(cliente => ({
                    ...cliente,
                    id: cliente.id || cliente.id_cliente
                }));

                // Guardar tanto los originales como los actuales
                setClientes(clientesConId);
                setClientesOriginales(clientesConId);
            } catch (error) {
                console.error("Error al cargar los clientes:", error);
                setError("No se pudieron cargar los clientes. Intenta nuevamente.");
            } finally {
                setLoading(false);
            }
        };

        fetchClientes();
    }, []);
    const actualizarClientes = async (clientesEditado) => {
        try {


            const dataToSend = {
                nombre: clientesEditado.nombre,
                apellido: clientesEditado.apellido,
                email: clientesEditado.email,
                telefono: clientesEditado.telefono,
                direccion: clientesEditado.direccion,
                password: clientesEditado.password,
                estado: clientesEditado.estado,
            };

            console.log("Datos para actualizar cliente:", dataToSend);

            const response = await fetch(`https://spabackend-production-e093.up.railway.app/clientesAdm/${clientesEditado.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al actualizar el cliente');
            }

            return await response.json();
        } catch (error) {
            console.error('Error al actualizar el cliente:', error);
            throw error;
        }
    };

    const crearCliente = async (nuevoCliente) => {
        try {
            console.log("Datos recibidos para crear cliente:", nuevoCliente);


            const dataToSend = {
                nombre: nuevoCliente.nombre,
                apellido: nuevoCliente.apellido,
                telefono: nuevoCliente.telefono,
                direccion: nuevoCliente.direccion,
                password: nuevoCliente.password,
                estado: nuevoCliente.estado,
                email: nuevoCliente.email,

            };

            console.log("Datos a enviar para crear cliente:", dataToSend);

            const response = await fetch("https://spabackend-production-e093.up.railway.app/api/clientesAdm", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al crear el cliente');
            }

            return await response.json();
        } catch (error) {
            console.error('Error al crear el cliente:', error);
            throw error;
        }
    };

    const eliminarCliente = async (id) => {
        try {
            const response = await fetch(`https://spabackend-production-e093.up.railway.app/clientesAdm/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al eliminar el clientes');
            }

            return await response.json();
        } catch (error) {
            console.error('Error al eliminar el clientes:', error);
            throw error;
        }
    };
    const handleFilterChange = (filtroTexto) => {
        const clientesFiltrados = clientesOriginales.filter(c =>
            `${c.nombre} ${c.apellido} ${c.email}`.toLowerCase().includes(filtroTexto.toLowerCase()));
        setClientes(clientesFiltrados);
    };

    const handleAgregar = () => {
        setModo("crear");
        setFormulario({
            nombre: "",
            apellido: "",
            email: "",
            telefono: "",
            direccion: "",
            password: "1",
            fecha_registro: "",
            estado: "",
        });
        setMostrarModal(true);
    };

    const handleEditar = () => {
        if (clienteSeleccionado) {
            setModo("editar");
            setFormulario({ ...clienteSeleccionado });
            setMostrarModal(true);
        }
    };

    const handleGuardar = async () => {
        try {
            setLoading(true);
            setError(null);

            // Validación básica
            if (
                !formulario.nombre ||
                !formulario.apellido ||
                !formulario.direccion ||
                !formulario.email ||
                !formulario.telefono
            ) {
                setError("Todos los campos son obligatorios");
                setLoading(false);
                return;
            }

            console.log("Intentando guardar cliente:", formulario);

            if (modo === "crear") {
                const resultado = await crearCliente(formulario);
                console.log("Resultado API:", resultado);

                const nuevoCliente = { ...formulario, id: resultado.id };

                const clienteParaTabla = {
                    id: nuevoCliente.id,
                    nombre: nuevoCliente.nombre,
                    apellido: nuevoCliente.apellido,
                    direccion: nuevoCliente.direccion,
                    password: nuevoCliente.password,
                    estado: nuevoCliente.estado,
                    email: nuevoCliente.email,
                    telefono: nuevoCliente.telefono
                };

                setClientes([...clientes, clienteParaTabla]);

                showPopup({
                    type: 'success',
                    title: "Éxito",
                    message: 'Cliente creado correctamente'
                });
            } else {
                await actualizarClientes(formulario);

                setClientes(clientes.map(p =>
                    p.id === formulario.id ? { ...formulario, id: p.id } : p
                ));

                showPopup({
                    type: 'success',
                    title: "Éxito",
                    message: 'Cliente actualizado correctamente'
                });
            }

            setMostrarModal(false);
            setClienteSeleccionado(null);
        } catch (error) {
            console.error("Error al guardar:", error);
            setError("Error al guardar los cambios: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEliminar = async () => {
        if (!clienteSeleccionado) return;

        if (window.confirm("¿Estás seguro de querer eliminar a este cliente?")) {
            try {
                setLoading(true);
                await eliminarCliente(clienteSeleccionado.id);

                // Remover el profesional de la lista mostrada en UI
                setClientes(clientes.filter(p => p.id !== clienteSeleccionado.id));

                setClienteSeleccionado(null);
                showPopup({
                    type: 'success',
                    title: "Éxito",
                    message: 'Cliente eliminado correctamente'
                });
            } catch (error) {
                setError("Error al eliminar el Cliente: " + error.message);
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
        <div id="clientes">
            <h2>Clientes</h2>
            <button className="btn-agregar" onClick={handleAgregar} disabled={loading}>
                Agregar Cliente
            </button>
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
                                <td>{p.nombre}</td>
                                <td>{p.apellido}</td>
                                <td>{p.direccion}</td>
                                <td>{p.email}</td>
                                <td>{p.telefono}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <div className="acciones-turno">
                <button className="btn-editar" disabled={!clienteSeleccionado || loading} onClick={handleEditar}>
                    Editar
                </button>
                <button className="btn-eliminar" disabled={!clienteSeleccionado || loading} onClick={handleEliminar}>
                    Eliminar
                </button>
            </div>

            <ModalForm
                isOpen={mostrarModal}
                onClose={handleCancelar}
                title={`${modo === "crear" ? "Agregar" : "Editar"} Cliente`}
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
                <input
                    type="password"
                    placeholder="Contraseña"
                    value={formulario.password}
                    onChange={e => setFormulario({ ...formulario, password: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Dirección"
                    value={formulario.direccion}
                    onChange={e => setFormulario({ ...formulario, direccion: e.target.value })}
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
            </ModalForm>
        </div>
    );
};

export default ClientesSection;