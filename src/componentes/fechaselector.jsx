import React, { useState, useEffect } from 'react';

const FechaSelector = ({ idCliente, fechaSeleccionada, onFechaChange, forceRefresh }) => {
    const [fechasDisponibles, setFechasDisponibles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ✅ Función mejorada para parsear fechas con debugging
    const parsearFecha = (fechaInput) => {
        console.log(`🔍 FechaSelector - Parseando fecha: "${fechaInput}" (tipo: ${typeof fechaInput})`);
        
        if (!fechaInput) {
            console.error('❌ FechaSelector - Fecha es null o undefined');
            return null;
        }

        let fecha;
        
        try {
            if (typeof fechaInput === 'string') {
                if (fechaInput.includes('/')) {
                    // Formato YYYY/MM/DD
                    console.log('📅 FechaSelector - Detectado formato YYYY/MM/DD');
                    const [año, mes, dia] = fechaInput.split('/');
                    fecha = new Date(parseInt(año), parseInt(mes) - 1, parseInt(dia));
                } else if (fechaInput.includes('-')) {
                    // Formato YYYY-MM-DD
                    console.log('📅 FechaSelector - Detectado formato YYYY-MM-DD');
                    fecha = new Date(fechaInput);
                } else if (fechaInput.match(/^\d+$/)) {
                    // Timestamp
                    console.log('📅 FechaSelector - Detectado timestamp');
                    fecha = new Date(parseInt(fechaInput));
                } else {
                    // Intentar parsing directo
                    console.log('📅 FechaSelector - Intentando parsing directo');
                    fecha = new Date(fechaInput);
                }
            } else {
                // Ya es un objeto Date o timestamp numérico
                fecha = new Date(fechaInput);
            }

            // Verificar si la fecha es válida
            if (isNaN(fecha.getTime())) {
                console.error(`❌ FechaSelector - Fecha inválida después del parsing: ${fechaInput}`);
                return null;
            }

            console.log(`✅ FechaSelector - Fecha parseada correctamente: ${fecha.toISOString()}`);
            return fecha;
        } catch (error) {
            console.error(`❌ FechaSelector - Error al parsear fecha "${fechaInput}":`, error);
            return null;
        }
    };

    // ✅ Función para formatear fecha de BD a formato display (con manejo de errores)
    const formatearFechaDisplay = (fechaBD) => {
        try {
            console.log(`🗓️ FechaSelector - Formateando para display: ${fechaBD}`);
            
            const fecha = parsearFecha(fechaBD);
            if (!fecha) {
                console.error(`❌ FechaSelector - No se pudo parsear fecha para display: ${fechaBD}`);
                return 'Fecha inválida';
            }
            
            // ✅ Usar UTC para mantener consistencia con el backend
            const dia = fecha.getUTCDate().toString().padStart(2, '0');
            const mes = (fecha.getUTCMonth() + 1).toString().padStart(2, '0');
            const año = fecha.getUTCFullYear();
            
            const fechaFormateada = `${dia}/${mes}/${año}`;
            console.log(`✅ FechaSelector - Fecha display formateada: ${fechaBD} -> ${fechaFormateada}`);
            
            return fechaFormateada;
        } catch (error) {
            console.error(`❌ FechaSelector - Error al formatear fecha display ${fechaBD}:`, error);
            return 'Error de fecha';
        }
    };

    // ✅ Función para validar si una fecha ya pasó (con manejo de errores)
    const esFechaPasada = (fechaCarrito) => {
        try {
            console.log(`📅 FechaSelector - Validando si es fecha pasada: ${fechaCarrito}`);
            
            // ✅ Obtener la fecha actual en UTC
            const fechaActual = new Date();
            fechaActual.setUTCHours(0, 0, 0, 0);

            // Parsear la fecha del carrito
            const fechaParaComparar = parsearFecha(fechaCarrito);
            if (!fechaParaComparar) {
                console.log(`❌ FechaSelector - No se pudo parsear fecha para comparar: ${fechaCarrito}`);
                return true; // Si no se puede parsear, considerarla como pasada por seguridad
            }

            // ✅ Resetear horas en UTC
            fechaParaComparar.setUTCHours(0, 0, 0, 0);

            console.log(`📅 FechaSelector - Comparando fechas:`);
            console.log(`   Fecha carrito: ${fechaCarrito} -> ${fechaParaComparar.toISOString()}`);
            console.log(`   Fecha actual: ${fechaActual.toISOString()}`);
            
            const esPasada = fechaParaComparar < fechaActual;
            console.log(`   ¿Es fecha pasada? ${esPasada}`);

            return esPasada;
        } catch (error) {
            console.error(`❌ FechaSelector - Error al validar fecha pasada ${fechaCarrito}:`, error);
            return true; // En caso de error, considerarla como pasada por seguridad
        }
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

            console.log(`🚀 FechaSelector - Obteniendo carritos para cliente: ${idCliente}`);
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
            console.log(`📦 FechaSelector - Carritos recibidos del backend:`, carritos);
            
            // ✅ Filtrar carritos pendientes Y que no hayan pasado la fecha
            const carritosPendientesYFuturos = carritos.filter(carrito => {
                console.log(`\n🔍 FechaSelector - Evaluando carrito ${carrito.id}:`);
                console.log(`   Estado: ${carrito.estado}`);
                console.log(`   Fecha raw: ${carrito.fecha}`);
                
                // Verificar que el estado sea Pendiente
                if (carrito.estado !== 'Pendiente') {
                    console.log(`   ❌ Descartado por estado: ${carrito.estado}`);
                    return false;
                }
                
                // Verificar que la fecha no haya pasado
                if (esFechaPasada(carrito.fecha)) {
                    console.log(`   ❌ Descartado por fecha pasada: ${carrito.fecha}`);
                    return false;
                }
                
                console.log(`   ✅ Carrito válido`);
                return true;
            });

            console.log(`📊 FechaSelector - Resumen de filtrado:`);
            console.log(`   Carritos totales: ${carritos.length}`);
            console.log(`   Carritos pendientes y futuros: ${carritosPendientesYFuturos.length}`);

            // Crear array de fechas únicas con formato
            const fechasUnicas = [...new Set(carritosPendientesYFuturos.map(carrito => carrito.fecha))]
                .map(fecha => {
                    console.log(`🗓️ FechaSelector - Procesando fecha única: ${fecha}`);
                    const textoDisplay = formatearFechaDisplay(fecha);
                    const conteoCarritos = carritosPendientesYFuturos.filter(c => c.fecha === fecha).length;
                    
                    return {
                        valor: fecha,
                        texto: textoDisplay,
                        carritosCount: conteoCarritos
                    };
                })
                .filter(fecha => fecha.texto !== 'Fecha inválida' && fecha.texto !== 'Error de fecha') // Filtrar fechas inválidas
                .sort((a, b) => {
                    // Ordenar por fecha usando las fechas parseadas
                    const fechaA = parsearFecha(a.valor);
                    const fechaB = parsearFecha(b.valor);
                    if (!fechaA || !fechaB) return 0;
                    return fechaA - fechaB;
                });

            console.log(`🗂️ FechaSelector - Fechas únicas procesadas:`, fechasUnicas);
            setFechasDisponibles(fechasUnicas);

            // ✅ Si la fecha actualmente seleccionada ya no está disponible, limpiarla
            if (fechaSeleccionada && !fechasUnicas.some(f => f.valor === fechaSeleccionada)) {
                console.log(`⚠️ FechaSelector - Fecha seleccionada ${fechaSeleccionada} ya no está disponible, limpiando selección`);
                onFechaChange(null);
            }

            // Si hay fechas disponibles y no hay una seleccionada, seleccionar la primera
            if (fechasUnicas.length > 0 && !fechaSeleccionada) {
                console.log(`🎯 FechaSelector - Seleccionando automáticamente la primera fecha: ${fechasUnicas[0].valor}`);
                onFechaChange(fechasUnicas[0].valor);
            }

        } catch (error) {
            console.error('❌ FechaSelector - Error al obtener carritos:', error);
            setError('Error al cargar fechas: ' + error.message);
        } finally {
            setLoading(false);
        }
    }; // ✅ CIERRE CORRECTO DE LA FUNCIÓN

    // Efecto para cargar las fechas cuando cambia el idCliente
    useEffect(() => {
        obtenerCarritosPendientes();
    }, [idCliente]);

    // ✅ Efecto para refrescar cuando se solicita desde props
    useEffect(() => {
        if (forceRefresh && idCliente) {
            console.log('⚡ FechaSelector - Refresco forzado solicitado');
            obtenerCarritosPendientes();
        }
    }, [forceRefresh]);

    // ✅ Efecto para recargar fechas periódicamente (opcional - para casos donde las fechas pasan mientras el usuario está en la página)
    useEffect(() => {
        // Recargar fechas cada 5 minutos para filtrar fechas que hayan pasado
        const interval = setInterval(() => {
            console.log('🔄 FechaSelector - Recarga automática de fechas para filtrar fechas pasadas');
            obtenerCarritosPendientes();
        }, 5 * 60 * 1000); // 5 minutos

        return () => clearInterval(interval);
    }, [idCliente]);

    // Función para recargar fechas (útil para actualizar después de cambios)
    const recargarFechas = () => {
        console.log('🔄 FechaSelector - Recarga manual de fechas solicitada');
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