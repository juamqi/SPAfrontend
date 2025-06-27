import React, { useState, useEffect } from "react";
import { usePopupContext } from "../componentes/popupcontext.jsx";

const PagosSection = () => {
    const [pagos, setPagos] = useState([]);
    const [pagosFiltrados, setPagosFiltrados] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Estados para filtros
    const [servicios, setServicios] = useState([]);
    const [profesionales, setProfesionales] = useState([]);
    const [filtros, setFiltros] = useState({
        servicio: "",
        profesional: "",
        fechaInicio: "",
        fechaFin: ""
    });

    const { showPopup } = usePopupContext();

    // Función para obtener todos los pagos
    const fetchPagos = async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            const response = await fetch("https://spabackend-production-e093.up.railway.app/api/pagosAdm");
            if (!response.ok) {
                throw new Error("Error al obtener los pagos");
            }
            
            const data = await response.json();
            console.log("Pagos recibidos:", data);
            setPagos(data);
            setPagosFiltrados(data);
        } catch (error) {
            console.error("Error al cargar los pagos:", error);
            setError("No se pudieron cargar los pagos. Intenta nuevamente.");
            showPopup({
                type: 'error',
                title: 'Error',
                message: 'No se pudieron cargar los pagos',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Función para obtener servicios para el filtro
    const fetchServicios = async () => {
        try {
            const response = await fetch("https://spabackend-production-e093.up.railway.app/api/serviciosAdm");
            if (!response.ok) throw new Error("Error al obtener servicios");
            const data = await response.json();
            setServicios(data);
        } catch (error) {
            console.error("Error al cargar servicios:", error);
        }
    };

    // Función para obtener profesionales para el filtro
    const fetchProfesionales = async () => {
        try {
            const response = await fetch("https://spabackend-production-e093.up.railway.app/api/profesionalesAdm");
            if (!response.ok) throw new Error("Error al obtener profesionales");
            const data = await response.json();
            setProfesionales(data);
        } catch (error) {
            console.error("Error al cargar profesionales:", error);
        }
    };

    // Cargar datos iniciales
    useEffect(() => {
        fetchPagos();
        fetchServicios();
        fetchProfesionales();
    }, []);

    // Función para aplicar filtros
    const aplicarFiltros = () => {
        let pagosFiltradosTemp = [...pagos];

        // Filtro por servicio
        if (filtros.servicio) {
            const servicioSeleccionado = servicios.find(s => s.id == filtros.servicio);
            if (servicioSeleccionado) {
                pagosFiltradosTemp = pagosFiltradosTemp.filter(pago => 
                    pago.servicio === servicioSeleccionado.nombre
                );
            }
        }

        // Filtro por profesional
        if (filtros.profesional) {
            const profesionalSeleccionado = profesionales.find(p => p.id == filtros.profesional);
            if (profesionalSeleccionado) {
                const nombreCompleto = `${profesionalSeleccionado.nombre} ${profesionalSeleccionado.apellido}`;
                pagosFiltradosTemp = pagosFiltradosTemp.filter(pago => 
                    pago.profesional === nombreCompleto
                );
            }
        }

        // Filtro por rango de fechas - CORREGIDO para comparación de strings
        if (filtros.fechaInicio && filtros.fechaFin) {
            pagosFiltradosTemp = pagosFiltradosTemp.filter(pago => {
                // Comparar directamente como strings en formato YYYY-MM-DD
                return pago.fecha_pago >= filtros.fechaInicio && pago.fecha_pago <= filtros.fechaFin;
            });
        } else if (filtros.fechaInicio) {
            pagosFiltradosTemp = pagosFiltradosTemp.filter(pago => {
                return pago.fecha_pago >= filtros.fechaInicio;
            });
        } else if (filtros.fechaFin) {
            pagosFiltradosTemp = pagosFiltradosTemp.filter(pago => {
                return pago.fecha_pago <= filtros.fechaFin;
            });
        }

        setPagosFiltrados(pagosFiltradosTemp);
    };

    // Aplicar filtros cada vez que cambien
    useEffect(() => {
        aplicarFiltros();
    }, [filtros, pagos]);

    // Función para limpiar filtros
    const limpiarFiltros = () => {
        setFiltros({
            servicio: "",
            profesional: "",
            fechaInicio: "",
            fechaFin: ""
        });
    };

    // Función para manejar cambios en los filtros
    const handleFiltroChange = (campo, valor) => {
        setFiltros(prev => ({
            ...prev,
            [campo]: valor
        }));
    };

    // Función para formatear fecha
    const formatearFecha = (fecha) => {
        if (!fecha) return "Sin fecha";
        const fechaObj = new Date(fecha);
        return fechaObj.toLocaleDateString('es-AR');
    };

    // Función para formatear precio
    const formatearPrecio = (precio) => {
        return `$${Number(precio).toFixed(2)}`;
    };

    // Calcular totales
    const calcularTotales = () => {
        const total = pagosFiltrados.reduce((sum, pago) => sum + Number(pago.precio_pagado), 0);
        return {
            cantidad: pagosFiltrados.length,
            total: total
        };
    };

    const totales = calcularTotales();

    return (
        <div id="pagos" className="turnos-container">
            <h2>Pagos</h2>

            {error && <div className="error-message">{error}</div>}

            {/* Filtros */}
            <div className="filtros-pagos">
                <div className="filtros-row">
                    <div className="filtro-grupo">
                        <label htmlFor="filtro-servicio">Servicio:</label>
                        <select
                            id="filtro-servicio"
                            value={filtros.servicio}
                            onChange={(e) => handleFiltroChange('servicio', e.target.value)}
                            className="filtro-select"
                        >
                            <option value="">Todos los servicios</option>
                            {servicios.map(servicio => (
                                <option key={servicio.id} value={servicio.id}>
                                    {servicio.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filtro-grupo">
                        <label htmlFor="filtro-profesional">Profesional:</label>
                        <select
                            id="filtro-profesional"
                            value={filtros.profesional}
                            onChange={(e) => handleFiltroChange('profesional', e.target.value)}
                            className="filtro-select"
                        >
                            <option value="">Todos los profesionales</option>
                            {profesionales.map(profesional => (
                                <option key={profesional.id} value={profesional.id}>
                                    {profesional.nombre} {profesional.apellido}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="filtros-row">
                    <div className="filtro-grupo">
                        <label htmlFor="filtro-fecha-inicio">Fecha inicio:</label>
                        <input
                            id="filtro-fecha-inicio"
                            type="date"
                            value={filtros.fechaInicio}
                            onChange={(e) => handleFiltroChange('fechaInicio', e.target.value)}
                            className="filtro-input"
                        />
                    </div>

                    <div className="filtro-grupo">
                        <label htmlFor="filtro-fecha-fin">Fecha fin:</label>
                        <input
                            id="filtro-fecha-fin"
                            type="date"
                            value={filtros.fechaFin}
                            onChange={(e) => handleFiltroChange('fechaFin', e.target.value)}
                            className="filtro-input"
                        />
                    </div>

                    <div className="filtro-grupo">
                        <button 
                            className="btn-limpiar-filtros"
                            onClick={limpiarFiltros}
                        >
                            Limpiar Filtros
                        </button>
                    </div>
                </div>
            </div>

            {/* Información de resultados */}
            <div className="filtros-info">
                <p>
                    Mostrando {pagosFiltrados.length} de {pagos.length} pagos
                    {pagosFiltrados.length > 0 && (
                        <span> - Total: {formatearPrecio(totales.total)}</span>
                    )}
                </p>
            </div>

            {isLoading ? (
                <p>Cargando...</p>
            ) : (
                <div className="tabla-container">
                    <table className="tabla">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Cliente</th>
                                <th>Profesional</th>
                                <th>Servicio</th>
                                <th>Fecha Turno</th>
                                <th>Fecha Pago</th>
                                <th>Precio Pagado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pagosFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: "center" }}>
                                        {pagos.length === 0 ? "No hay pagos disponibles" : "No hay pagos que coincidan con los filtros aplicados"}
                                    </td>
                                </tr>
                            ) : (
                                pagosFiltrados.map(pago => (
                                    <tr key={pago.id}>
                                        <td>{pago.id}</td>
                                        <td>{pago.cliente}</td>
                                        <td>{pago.profesional}</td>
                                        <td>{pago.servicio || "N/A"}</td>
                                        <td>{formatearFecha(pago.fecha_turno)}</td>
                                        <td>{formatearFecha(pago.fecha_pago)}</td>
                                        <td className="precio-cell">{formatearPrecio(pago.precio_pagado)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Resumen de totales */}
            {pagosFiltrados.length > 0 && (
                <div className="resumen-totales">
                    <div className="resumen-card">
                        <h4>Resumen</h4>
                        <div className="resumen-item">
                            <span>Cantidad de pagos:</span>
                            <span>{totales.cantidad}</span>
                        </div>
                        <div className="resumen-item total">
                            <span>Total pagado:</span>
                            <span>{formatearPrecio(totales.total)}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PagosSection;