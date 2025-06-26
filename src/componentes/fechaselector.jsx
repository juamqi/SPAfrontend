import React, { useState, useEffect } from 'react';

const FechaSelector = ({ idCliente, fechaSeleccionada, onFechaChange }) => {
    const [fechasDisponibles, setFechasDisponibles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ✅ Función para formatear fecha de BD a formato display (usando UTC para consistencia)
    const formatearFechaDisplay = (fechaBD) => {
        const fecha = new Date(fechaBD);
        // Usar UTC para evitar problemas de zona horaria
        const dia = fecha.getUTCDate().toString().padStart(2, '0');
        const mes = (fecha.getUTCMonth() + 1).toString().padStart(2, '0');
        const año = fecha.getUTCFullYear();
        
        const fechaFormateada = `${dia}/${mes}/${año}`;
        console.log(`🗓️ FechaSelector - Formateando fecha: ${fechaBD} -> ${fechaFormateada}`);
        
        return fechaFormateada;
    };

    // ✅ Función para validar si una fecha ya pasó (usando UTC para consistencia)
    const esFechaPasada = (fechaCarrito) => {
        // Obtener la fecha actual (solo fecha, sin hora) en UTC
        const fechaActual = new Date();
        fechaActual.setUTCHours(0, 0, 0, 0);

        // Convertir la fecha del carrito a objeto Date usando UTC
        let fechaParaComparar;
        
        // Verificar el formato de fecha que viene del backend
        if (fechaCarrito.includes('/')) {
            // Formato YYYY/MM/DD
            const [año, mes, dia] = fechaCarrito.split('/');
            fechaParaComparar = new Date(Date.UTC(parseInt(año), parseInt(mes) - 1, parseInt(dia)));
        } else if (fechaCarrito.includes('-')) {
            // Formato YYYY-MM-DD
            fechaParaComparar = new Date(fechaCarrito + 'T00:00:00.000Z');
        } else {
            // Si es timestamp u otro formato
            fechaParaComparar = new Date(fechaCarrito);
            fechaParaComparar.setUTCHours(0, 0, 0, 0);
        }

        console.log(`📅 FechaSelector - Comparando fechas:`);
        console.log(`   Fecha carrito: ${fechaCarrito} -> ${fechaParaComparar.toISOString()}`);
        console.log(`   Fecha actual: ${fechaActual.toISOString()}`);
        console.log(`   ¿Es fecha pasada? ${fechaParaComparar < fechaActual}`);

        // Retorna true si la fecha ya pasó
        return fechaParaComparar < fechaActual;
    };

    // Función para obtener carritos pendientes del usuario
    const obtenerCarritosPendientes = async () => {
        if (!idCliente) {
            setError('ID de cliente no proporcionado');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`https://spabackend-production-e093.up.railway.app/api/carritos/cliente/${idCliente}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    // No hay carritos para este cliente
                    setFechasDisponibles([]);
                    return;
                }
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const carritos = await response.json();
            
            // ✅ Filtrar carritos pendientes Y que no hayan pasado la fecha
            const carritosPendientesYFuturos = carritos.filter(carrito => {
                // Verificar que el estado sea Pendiente
                if (carrito.estado !== 'Pendiente') {
                    return false;
                }
                
                // Verificar que la fecha no haya pasado
                if (esFechaPasada(carrito.fecha)) {
                    console.log(`Fecha pasada filtrada: ${carrito.fecha}`);
                    return false;
                }
                
                return true;
            });

            console.log('Carritos totales:', carritos.length);
            console.log('Carritos pendientes y futuros:', carritosPendientesYFuturos.length);

            // Crear array de fechas únicas con formato
            const fechasUnicas = [...new Set(carritosPendientesYFuturos.map(carrito => carrito.fecha))]
                .map(fecha => ({
                    valor: fecha,
                    texto: formatearFechaDisplay(fecha),
                    carritosCount: carritosPendientesYFuturos.filter(c => c.fecha === fecha).length
                }))
                .sort((a, b) => new Date(a.valor) - new Date(b.valor)); // Ordenar por fecha

            setFechasDisponibles(fechasUnicas);

            // ✅ Si la fecha actualmente seleccionada ya no está disponible, limpiarla
            if (fechaSeleccionada && !fechasUnicas.some(f => f.valor === fechaSeleccionada)) {
                console.log(`Fecha seleccionada ${fechaSeleccionada} ya no está disponible, limpiando selección`);
                onFechaChange(null);
            }

            // Si hay fechas disponibles y no hay una seleccionada, seleccionar la primera
            if (fechasUnicas.length > 0 && !fechaSeleccionada) {
                console.log(`Seleccionando automáticamente la primera fecha: ${fechasUnicas[0].valor}`);
                onFechaChange(fechasUnicas[0].valor);
            }

        } catch (error) {
            console.error('Error al obtener carritos:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Efecto para cargar las fechas cuando cambia el idCliente
    useEffect(() => {
        obtenerCarritosPendientes();
    }, [idCliente]);

    // ✅ Efecto para recargar fechas periódicamente (opcional - para casos donde las fechas pasan mientras el usuario está en la página)
    useEffect(() => {
        // Recargar fechas cada 5 minutos para filtrar fechas que hayan pasado
        const interval = setInterval(() => {
            console.log('Recarga automática de fechas para filtrar fechas pasadas');
            obtenerCarritosPendientes();
        }, 5 * 60 * 1000); // 5 minutos

        return () => clearInterval(interval);
    }, [idCliente]);

    // Función para recargar fechas (útil para actualizar después de cambios)
    const recargarFechas = () => {
        console.log('Recarga manual de fechas solicitada');
        obtenerCarritosPendientes();
    };

    if (loading) {
        return (
            <div className="fecha-selector">
                <span className="fecha-label">Servicios reservados para:</span>
                <div className="fecha-input-container">
                    <select className="fecha-input" disabled>
                        <option>Cargando fechas...</option>
                    </select>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fecha-selector">
                <span className="fecha-label">Servicios reservados para:</span>
                <div className="fecha-input-container">
                    <select className="fecha-input" disabled>
                        <option>Error al cargar fechas</option>
                    </select>
                </div>
                <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                    {error}
                </div>
            </div>
        );
    }

    if (fechasDisponibles.length === 0) {
        return (
            <div className="fecha-selector">
                <span className="fecha-label">Servicios reservados para:</span>
                <div className="fecha-input-container">
                    <select className="fecha-input" disabled>
                        <option>No hay carritos pendientes</option>
                    </select>
                </div>
                <div style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>
                    ✓ Solo se muestran fechas futuras
                </div>
            </div>
        );
    }

    return (
        <div className="fecha-selector">
            <span className="fecha-label">Servicios reservados para:</span>
            <div className="fecha-input-container">
                <select
                    value={fechaSeleccionada || ''}
                    onChange={(e) => onFechaChange(e.target.value)}
                    className="fecha-input"
                >
                    <option value="">Selecciona una fecha</option>
                    {fechasDisponibles.map((fecha) => (
                        <option key={fecha.valor} value={fecha.valor}>
                            {fecha.texto} ({fecha.carritosCount} carrito{fecha.carritosCount !== 1 ? 's' : ''})
                        </option>
                    ))}
                </select>
                <span className="fecha-dropdown-arrow">▼</span>
            </div>
            {/* Botón para recargar fechas si es necesario */}
            <button 
                onClick={recargarFechas}
                style={{
                    marginTop: '8px',
                    padding: '4px 8px',
                    fontSize: '12px',
                    backgroundColor: 'transparent',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    color: '#666'
                }}
                title="Actualizar lista de fechas disponibles"
            >
                🔄 Actualizar fechas
            </button>
        </div>
    );
};

export default FechaSelector;