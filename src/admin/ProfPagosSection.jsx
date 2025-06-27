import React, { useState, useEffect } from "react";
import { usePopupContext } from "../componentes/popupcontext.jsx";
import { useProfAuth } from '../context/ProfAuthContext'; // Importar el contexto

const ProfPagosSection = () => {
    const [pagos, setPagos] = useState([]);
    const [pagosFiltrados, setPagosFiltrados] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Estados para filtros (sin profesional ya que está implícito)
    const [servicios, setServicios] = useState([]);
    const [filtros, setFiltros] = useState({
        servicio: "",
        fechaInicio: "",
        fechaFin: ""
    });

    const { showPopup } = usePopupContext();
    const { profesional } = useProfAuth(); // Usar el contexto en lugar de localStorage

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

    // Cargar datos cuando se identifica al profesional
    useEffect(() => {
        if (profesional?.id_profesional) {
            fetchPagosProfesional();
            fetchServicios();
        }
    }, [profesional]);

    // Función para formatear fecha para input
    const formatearFechaParaInput = (fecha) => {
        if (!fecha) return "";
        if (typeof fecha === 'string' && fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return fecha;
        }
        if (fecha instanceof Date) {
            return fecha.toISOString().split('T')[0];
        }
        return fecha;
    };

    // Función para ajustar fecha sumando un día (para compensar zona horaria)
    const ajustarFechaParaComparacion = (fechaString) => {
        if (!fechaString) return fechaString;
        
        const fecha = new Date(fechaString + 'T00:00:00');
        fecha.setDate(fecha.getDate() + 1);
        
        const year = fecha.getFullYear();
        const month = String(fecha.getMonth() + 1).padStart(2, '0');
        const day = String(fecha.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    };

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

        // Filtro por rango de fechas con ajuste de zona horaria
        if (filtros.fechaInicio && filtros.fechaFin) {
            const fechaInicioAjustada = ajustarFechaParaComparacion(filtros.fechaInicio);
            const fechaFinAjustada = ajustarFechaParaComparacion(filtros.fechaFin);
            
            console.log('Filtros de fecha - Original:', filtros.fechaInicio, '-', filtros.fechaFin);
            console.log('Filtros de fecha - Ajustados:', fechaInicioAjustada, '-', fechaFinAjustada);
            
            pagosFiltradosTemp = pagosFiltradosTemp.filter(pago => {
                return pago.fecha_pago >= fechaInicioAjustada && pago.fecha_pago <= fechaFinAjustada;
            });
        } else if (filtros.fechaInicio) {
            const fechaInicioAjustada = ajustarFechaParaComparacion(filtros.fechaInicio);
            pagosFiltradosTemp = pagosFiltradosTemp.filter(pago => {
                return pago.fecha_pago >= fechaInicioAjustada;
            });
        } else if (filtros.fechaFin) {
            const fechaFinAjustada = ajustarFechaParaComparacion(filtros.fechaFin);
            pagosFiltradosTemp = pagosFiltradosTemp.filter(pago => {
                return pago.fecha_pago <= fechaFinAjustada;
            });
        }

        setPagosFiltrados(pagosFiltradosTemp);
    };

    // Aplicar filtros cada vez que cambien
    useEffect(() => {
        console.log('Filtros cambiaron:', filtros);
        aplicarFiltros();
    }, [filtros, pagos, servicios]);

    // Función para limpiar filtros
    const limpiarFiltros = () => {
        setFiltros({
            servicio: "",
            fechaInicio: "",
            fechaFin: ""
        });
        setError(null);
    };

    // Función para manejar cambios en los filtros
    const handleFiltroChange = (campo, valor) => {
        console.log(`Cambiando filtro ${campo} a:`, valor);
        
        // Validación específica para fechas
        if (campo === 'fechaInicio' || campo === 'fechaFin') {
            const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (valor && !fechaRegex.test(valor)) {
                console.error(`Formato de fecha inválido para ${campo}:`, valor);
                return;
            }
        }
        
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
                        <label htmlFor="filtro-servicio">Servicio:</label>
                        <select
                            id="filtro-servicio"
                            value={filtros.servicio}
                            onChange={(e) => handleFiltroChange('servicio', e.target.value)}
                            className="filtro-select"
                        >
                            <option value="">Todos mis servicios</option>
                            {servicios.map(servicio => (
                                <option key={servicio.id} value={servicio.id}>
                                    {servicio.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filtro-grupo">
                        <label htmlFor="filtro-fecha-inicio">Fecha inicio:</label>
                        <input
                            id="filtro-fecha-inicio"
                            type="date"
                            value={formatearFechaParaInput(filtros.fechaInicio)}
                            onChange={(e) => handleFiltroChange('fechaInicio', e.target.value)}
                            className="filtro-input"
                        />
                    </div>

                    <div className="filtro-grupo">
                        <label htmlFor="filtro-fecha-fin">Fecha fin:</label>
                        <input
                            id="filtro-fecha-fin"
                            type="date"
                            value={formatearFechaParaInput(filtros.fechaFin)}
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