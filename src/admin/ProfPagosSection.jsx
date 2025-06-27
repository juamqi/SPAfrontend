import React, { useState, useEffect } from "react";
import { usePopupContext } from "../componentes/popupcontext.jsx";
import { useProfAuth } from '../context/ProfAuthContext';

const ProfPagosSection = () => {
    const [pagos, setPagos] = useState([]);
    const [pagosFiltrados, setPagosFiltrados] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Estados para filtros (solo fechas, sin servicio ni profesional)
    const [filtros, setFiltros] = useState({
        fechaInicio: "",
        fechaFin: ""
    });

    const { showPopup } = usePopupContext();
    const { profesional } = useProfAuth();

    // Función para obtener pagos del profesional
    const fetchPagosProfesional = async () => {
        if (!profesional?.id_profesional) return;

        try {
            setIsLoading(true);
            setError(null);
            
            const response = await fetch(`https://spabackend-production-e093.up.railway.app/api/pagosAdm/profesional/${profesional.id_profesional}`);
            if (!response.ok) {
                throw new Error("Error al obtener los pagos");
            }
            
            const data = await response.json();
            console.log("Pagos del profesional recibidos:", data);
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
    // REMOVIDA - No es necesaria

    // Cargar datos cuando se identifica al profesional
    useEffect(() => {
        if (profesional?.id_profesional) {
            fetchPagosProfesional();
        }
    }, [profesional]);

    // Función para sumar días a la fecha (para compensar zona horaria)
    const sumarUnDia = (fechaString) => {
        if (!fechaString) return fechaString;
        
        const fecha = new Date(fechaString + 'T12:00:00');
        fecha.setDate(fecha.getDate() + 1);
        
        const year = fecha.getFullYear();
        const month = String(fecha.getMonth() + 1).padStart(2, '0');
        const day = String(fecha.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    };

    // Función para sumar 2 días a la fecha fin (para incluir el día completo)
    const sumarDosDias = (fechaString) => {
        if (!fechaString) return fechaString;
        
        const fecha = new Date(fechaString + 'T12:00:00');
        fecha.setDate(fecha.getDate() + 2);
        
        const year = fecha.getFullYear();
        const month = String(fecha.getMonth() + 1).padStart(2, '0');
        const day = String(fecha.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    };

    // Función para aplicar filtros
    const aplicarFiltros = () => {
        let pagosFiltradosTemp = [...pagos];

        // Filtro por rango de fechas - ajuste diferenciado para inicio y fin
        if (filtros.fechaInicio && filtros.fechaFin) {
            const fechaInicioAjustada = sumarUnDia(filtros.fechaInicio);
            const fechaFinAjustada = sumarDosDias(filtros.fechaFin);
            
            console.log('Fechas originales:', filtros.fechaInicio, '-', filtros.fechaFin);
            console.log('Fechas ajustadas:', fechaInicioAjustada, '-', fechaFinAjustada);
            
            pagosFiltradosTemp = pagosFiltradosTemp.filter(pago => {
                return pago.fecha_pago >= fechaInicioAjustada && pago.fecha_pago < fechaFinAjustada;
            });
        } else if (filtros.fechaInicio) {
            const fechaInicioAjustada = sumarUnDia(filtros.fechaInicio);
            pagosFiltradosTemp = pagosFiltradosTemp.filter(pago => {
                return pago.fecha_pago >= fechaInicioAjustada;
            });
        } else if (filtros.fechaFin) {
            const fechaFinAjustada = sumarDosDias(filtros.fechaFin);
            pagosFiltradosTemp = pagosFiltradosTemp.filter(pago => {
                return pago.fecha_pago < fechaFinAjustada;
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
            fechaInicio: "",
            fechaFin: ""
        });
        setError(null);
    };

    // Función para manejar cambios en los filtros - SIMPLE
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

    // Si no hay profesional autenticado
    if (!profesional?.id_profesional) {
        return (
            <div id="pagos" className="turnos-container">
                <h2>Mis Pagos</h2>
                <div className="error-message">
                    No se pudo identificar al profesional. Por favor, inicie sesión nuevamente.
                </div>
            </div>
        );
    }

    return (
        <div id="pagos" className="turnos-container">
            <h2>Mis Pagos</h2>

            {error && <div className="error-message">{error}</div>}

            {/* Filtros */}
            <div className="filtros-pagos">
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
                        <span> - Total recibido: {formatearPrecio(totales.total)}</span>
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
                                <th>Servicio</th>
                                <th>Fecha Turno</th>
                                <th>Fecha Pago</th>
                                <th>Precio Recibido</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pagosFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: "center" }}>
                                        {pagos.length === 0 ? "No hay pagos disponibles" : "No hay pagos que coincidan con los filtros aplicados"}
                                    </td>
                                </tr>
                            ) : (
                                pagosFiltrados.map(pago => (
                                    <tr key={pago.id}>
                                        <td>{pago.id}</td>
                                        <td>{pago.cliente}</td>
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
                        <h4>Resumen de Mis Ingresos</h4>
                        <div className="resumen-item">
                            <span>Cantidad de servicios realizados:</span>
                            <span>{totales.cantidad}</span>
                        </div>
                        <div className="resumen-item total">
                            <span>Total recibido:</span>
                            <span>{formatearPrecio(totales.total)}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfPagosSection;