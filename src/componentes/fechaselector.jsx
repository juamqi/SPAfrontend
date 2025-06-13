import React, { useState, useEffect } from 'react';

const FechaSelector = ({ idCliente, fechaSeleccionada, onFechaChange }) => {
    const [fechasDisponibles, setFechasDisponibles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Función para formatear fecha de BD a formato display
    const formatearFechaDisplay = (fechaBD) => {
        const fecha = new Date(fechaBD);
        const dia = fecha.getDate().toString().padStart(2, '0');
        const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const año = fecha.getFullYear();
        return `${dia}/${mes}/${año}`;
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
            
            // Filtrar solo carritos pendientes y extraer fechas únicas
            const carritosPendientes = carritos.filter(carrito => 
                carrito.estado === 'Pendiente'
            );

            // Crear array de fechas únicas con formato
            const fechasUnicas = [...new Set(carritosPendientes.map(carrito => carrito.fecha))]
                .map(fecha => ({
                    valor: fecha,
                    texto: formatearFechaDisplay(fecha),
                    carritosCount: carritosPendientes.filter(c => c.fecha === fecha).length
                }))
                .sort((a, b) => new Date(a.valor) - new Date(b.valor)); // Ordenar por fecha

            setFechasDisponibles(fechasUnicas);

            // Si hay fechas disponibles y no hay una seleccionada, seleccionar la primera
            if (fechasUnicas.length > 0 && !fechaSeleccionada) {
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

    // Función para recargar fechas (útil para actualizar después de cambios)
    const recargarFechas = () => {
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
                    {fechasDisponibles.map((fecha) => (
                        <option key={fecha.valor} value={fecha.valor}>
                            {fecha.texto} ({fecha.carritosCount} carrito{fecha.carritosCount !== 1 ? 's' : ''})
                        </option>
                    ))}
                </select>
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
            >
                🔄 Actualizar fechas
            </button>
        </div>
    );
};

export default FechaSelector;