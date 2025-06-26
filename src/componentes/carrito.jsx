import React, { useState, useEffect } from 'react';
import { X, ArrowLeft } from 'lucide-react';
import FechaSelector from './fechaselector.jsx';
import '../styles/carrito.css';



const CarritoCompleto = ({ isOpen, onClose, idCliente }) => {
    const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
    const [vistaActual, setVistaActual] = useState('carrito');

    // Estados para datos del backend
    const [servicios, setServicios] = useState([]);
    const [carritoSeleccionado, setCarritoSeleccionado] = useState(null);
    const [carritosPorFecha, setCarritosPorFecha] = useState(new Map());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [mostrarModalExito, setMostrarModalExito] = useState(false);

    // Estados para el formulario de tarjeta
    const [formData, setFormData] = useState({
        cardholderName: '',
        cardNumber: '',
        expiryDate: '',
        cvv: ''
    });

    //boton pagar actualiza estado de carrito
    const actualizarEstadoCarrito = async (idCarrito, nuevoEstado) => {
        try {
            const response = await fetch(`https://spabackend-production-e093.up.railway.app/api/carritos/estado/${idCarrito}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ estado: nuevoEstado })
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error al actualizar estado del carrito:', error);
            throw error;
        }
    };

    // ✅ Función mejorada para parsear fechas con debugging
    const parsearFecha = (fechaInput) => {
        console.log(`🔍 Parseando fecha: "${fechaInput}" (tipo: ${typeof fechaInput})`);
        
        if (!fechaInput) {
            console.error('❌ Fecha es null o undefined');
            return null;
        }

        let fecha;
        
        try {
            if (typeof fechaInput === 'string') {
                if (fechaInput.includes('/')) {
                    // Formato YYYY/MM/DD
                    console.log('📅 Detectado formato YYYY/MM/DD');
                    const [año, mes, dia] = fechaInput.split('/');
                    fecha = new Date(parseInt(año), parseInt(mes) - 1, parseInt(dia));
                } else if (fechaInput.includes('-')) {
                    // Formato YYYY-MM-DD
                    console.log('📅 Detectado formato YYYY-MM-DD');
                    fecha = new Date(fechaInput);
                } else if (fechaInput.match(/^\d+$/)) {
                    // Timestamp
                    console.log('📅 Detectado timestamp');
                    fecha = new Date(parseInt(fechaInput));
                } else {
                    // Intentar parsing directo
                    console.log('📅 Intentando parsing directo');
                    fecha = new Date(fechaInput);
                }
            } else {
                // Ya es un objeto Date o timestamp numérico
                fecha = new Date(fechaInput);
            }

            // Verificar si la fecha es válida
            if (isNaN(fecha.getTime())) {
                console.error(`❌ Fecha inválida después del parsing: ${fechaInput}`);
                return null;
            }

            console.log(`✅ Fecha parseada correctamente: ${fecha.toISOString()}`);
            return fecha;
        } catch (error) {
            console.error(`❌ Error al parsear fecha "${fechaInput}":`, error);
            return null;
        }
    };

    // Función para obtener carritos del cliente y organizarlos por fecha
    const obtenerCarritosPorFecha = async () => {
        if (!idCliente) return;

        try {
            setLoading(true);
            setError(null);

            console.log(`🚀 Obteniendo carritos para cliente: ${idCliente}`);
            const response = await fetch(`https://spabackend-production-e093.up.railway.app/api/carritos/cliente/${idCliente}`);

            if (!response.ok) {
                if (response.status === 404) {
                    setCarritosPorFecha(new Map());
                    return;
                }
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const carritos = await response.json();
            console.log(`📦 Carritos recibidos del backend:`, carritos);

            // Obtener la fecha actual (solo fecha, sin hora)
            const fechaActual = new Date();
            fechaActual.setHours(0, 0, 0, 0);
            console.log(`🗓️ Fecha actual para comparación: ${fechaActual.toISOString()}`);

            // Filtrar carritos pendientes y que no hayan pasado la fecha
            const carritosPendientes = carritos.filter(carrito => {
                console.log(`\n🔍 Evaluando carrito ${carrito.id}:`);
                console.log(`   Estado: ${carrito.estado}`);
                console.log(`   Fecha raw: ${carrito.fecha}`);
                
                // Verificar que el estado sea Pendiente
                if (carrito.estado !== 'Pendiente') {
                    console.log(`   ❌ Descartado por estado: ${carrito.estado}`);
                    return false;
                }

                // Parsear la fecha del carrito
                const fechaCarrito = parsearFecha(carrito.fecha);
                if (!fechaCarrito) {
                    console.log(`   ❌ Descartado por fecha inválida`);
                    return false;
                }

                fechaCarrito.setHours(0, 0, 0, 0);
                console.log(`   Fecha parseada: ${fechaCarrito.toISOString()}`);
                
                const esFuturo = fechaCarrito >= fechaActual;
                console.log(`   ¿Es futuro? ${esFuturo}`);

                return esFuturo;
            });

            console.log(`📊 Resumen de filtrado:`);
            console.log(`   Carritos totales: ${carritos.length}`);
            console.log(`   Carritos pendientes y futuros: ${carritosPendientes.length}`);

            // Crear un Map con fecha como key y array de carritos como value
            const carritosPorFechaMap = new Map();
            carritosPendientes.forEach(carrito => {
                const fecha = carrito.fecha;
                if (!carritosPorFechaMap.has(fecha)) {
                    carritosPorFechaMap.set(fecha, []);
                }
                carritosPorFechaMap.get(fecha).push(carrito);
            });

            console.log(`🗂️ Carritos organizados por fecha:`, Array.from(carritosPorFechaMap.entries()));
            setCarritosPorFecha(carritosPorFechaMap);

        } catch (error) {
            console.error('❌ Error al obtener carritos por fecha:', error);
            setError('Error al cargar carritos: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Función para obtener turnos de un carrito específico
    const obtenerTurnosCarrito = async (idCarrito) => {
        if (!idCarrito) return;

        try {
            setLoading(true);
            setError(null);

            console.log('🔍 Obteniendo turnos para carrito ID:', idCarrito);

            const response = await fetch(`https://spabackend-production-e093.up.railway.app/api/carritos/${idCarrito}/turnos`);

            if (!response.ok) {
                if (response.status === 404) {
                    setServicios([]);
                    return;
                }
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const turnos = await response.json();
            console.log('📋 Turnos recibidos del backend:', turnos);

            // Transformar los datos del backend al formato esperado por el frontend
            const serviciosFormateados = turnos.map(turno => {
                console.log(`\n🔄 Procesando turno ${turno.id_turno}:`);
                console.log(`   fecha_hora raw: ${turno.fecha_hora}`);
                
                const fechaFormateada = formatearFecha(turno.fecha_hora);
                const horaFormateada = formatearHora(turno.fecha_hora);
                
                console.log(`   Fecha formateada: ${fechaFormateada}`);
                console.log(`   Hora formateada: ${horaFormateada}`);
                
                return {
                    id: turno.id_turno,
                    tipo: turno.servicio_nombre,
                    fecha: fechaFormateada,
                    hora: horaFormateada,
                    profesional: turno.profesional_nombre,
                    precio: turno.servicio_precio || 0,
                    duracion: turno.duracion_minutos,
                    estado: turno.estado,
                    comentarios: turno.comentarios
                };
            });

            console.log('✅ Servicios formateados finales:', serviciosFormateados);
            setServicios(serviciosFormateados);

        } catch (error) {
            console.error('❌ Error al obtener turnos del carrito:', error);
            setError('Error al cargar los servicios del carrito: ' + error.message);
            setServicios([]);
        } finally {
            setLoading(false);
        }
    };

    // Función para manejar cambio de fecha
    const handleFechaChange = (nuevaFecha) => {
        console.log('📅 Fecha seleccionada en CarritoCompleto:', nuevaFecha);
        setFechaSeleccionada(nuevaFecha);

        // Obtener carritos de esa fecha
        const carritosDeEsteFecha = carritosPorFecha.get(nuevaFecha) || [];
        console.log('🛒 Carritos encontrados para esta fecha:', carritosDeEsteFecha);

        if (carritosDeEsteFecha.length > 0) {
            // Por ahora tomamos el primer carrito de la fecha
            const primerCarrito = carritosDeEsteFecha[0];
            console.log('🎯 Carrito seleccionado:', primerCarrito);
            setCarritoSeleccionado(primerCarrito);
            obtenerTurnosCarrito(primerCarrito.id);
        } else {
            setCarritoSeleccionado(null);
            setServicios([]);
        }
    };

    // ✅ Función para formatear fecha desde timestamp a string (con manejo de errores)
    const formatearFecha = (fechaHora) => {
        try {
            console.log(`🔄 Formateando fecha desde: ${fechaHora}`);
            
            const fecha = parsearFecha(fechaHora);
            if (!fecha) {
                console.error(`❌ No se pudo parsear la fecha: ${fechaHora}`);
                return 'Fecha inválida';
            }
            
            // ✅ Usar UTC para mantener la fecha original sin ajustes de zona horaria
            const año = fecha.getUTCFullYear();
            const mes = (fecha.getUTCMonth() + 1).toString().padStart(2, '0');
            const dia = fecha.getUTCDate().toString().padStart(2, '0');
            
            const fechaFormateada = `${año}/${mes}/${dia}`;
            console.log(`✅ Fecha formateada: ${fechaHora} -> ${fechaFormateada}`);
            
            return fechaFormateada;
        } catch (error) {
            console.error(`❌ Error al formatear fecha ${fechaHora}:`, error);
            return 'Error de fecha';
        }
    };

    // ✅ Función para formatear hora desde timestamp (con manejo de errores)
    const formatearHora = (fechaHora) => {
        try {
            console.log(`🕐 Formateando hora desde: ${fechaHora}`);
            
            const fecha = parsearFecha(fechaHora);
            if (!fecha) {
                console.error(`❌ No se pudo parsear la hora: ${fechaHora}`);
                return 'Hora inválida';
            }
            
            // ✅ Usar UTC para mantener la hora original sin ajustes de zona horaria
            const horas = fecha.getUTCHours().toString().padStart(2, '0');
            const minutos = fecha.getUTCMinutes().toString().padStart(2, '0');
            
            const horaFormateada = `${horas}:${minutos}`;
            console.log(`✅ Hora formateada: ${fechaHora} -> ${horaFormateada}`);
            
            return horaFormateada;
        } catch (error) {
            console.error(`❌ Error al formatear hora ${fechaHora}:`, error);
            return 'Error de hora';
        }
    };

    // ✅ Cargar carritos cuando se abre el modal o cambia el cliente (sin dependencia de isOpen)
    useEffect(() => {
        if (idCliente) {
            obtenerCarritosPorFecha();
        }
    }, [idCliente]);

    // ✅ Efecto separado para cuando se abre el modal (para refrescar datos si es necesario)
    useEffect(() => {
        if (isOpen && idCliente && carritosPorFecha.size === 0) {
            // Solo volver a cargar si no hay datos
            obtenerCarritosPorFecha();
        }
    }, [isOpen]);

    // Limpiar estados cuando se cierra el modal
    useEffect(() => {
        if (!isOpen) {
            setFechaSeleccionada(null);
            setCarritoSeleccionado(null);
            setServicios([]);
            setVistaActual('carrito');
            setError(null);
            setMostrarModalExito(false);
            // ✅ NO limpiar carritosPorFecha para mantener los datos cargados
        }
    }, [isOpen]);

    const calcularTotal = () => {
        if (!carritoSeleccionado || !carritoSeleccionado.subtotal) {
            return 0;
        }

        const subtotal = carritoSeleccionado.subtotal;
        const descuento = subtotal * 0.15; // 15% descuento
        return subtotal - descuento;
    };

    const obtenerSubtotal = () => {
        return carritoSeleccionado?.subtotal || 0;
    };

    const formatearPrecio = (precio) => {
        return `$${precio.toLocaleString()}`;
    };

    // Funciones de navegación
    const irAPagoTarjeta = () => {
        if (!servicios || servicios.length === 0) return;

        // Obtener la fecha y hora actual
        const ahora = new Date();
        
        console.log('Fecha actual:', ahora);
        console.log('Servicios disponibles:', servicios);
        
        // Encontrar el servicio más próximo en el tiempo
        let servicioMasProximo = null;
        let menorDiferencia = Infinity;
        
        servicios.forEach(servicio => {
            // Convertir fecha de YYYY/MM/DD a formato ISO YYYY-MM-DD
            const fechaISO = servicio.fecha.replace(/\//g, '-');
            
            // Crear objeto Date a partir de la fecha y hora del servicio
            const fechaHoraServicio = new Date(`${fechaISO}T${servicio.hora}`);
            
            console.log(`Servicio: ${servicio.tipo}`);
            console.log(`Fecha original: ${servicio.fecha}, Hora: ${servicio.hora}`);
            console.log(`Fecha ISO: ${fechaISO}T${servicio.hora}`);
            console.log(`Date objeto: ${fechaHoraServicio}`);
            
            // Calcular diferencia en milisegundos
            const diferencia = fechaHoraServicio - ahora;
            console.log(`Diferencia en ms: ${diferencia}`);
            
            // Si es el más próximo (y es futuro), guardarlo
            if (diferencia > 0 && diferencia < menorDiferencia) {
                menorDiferencia = diferencia;
                servicioMasProximo = servicio;
                console.log(`Nuevo servicio más próximo encontrado: ${servicio.tipo}`);
            }
        });
        
        console.log('Servicio más próximo:', servicioMasProximo);
        
        // Si no hay servicios futuros, no permitir el pago
        if (!servicioMasProximo) {
            alert('No hay servicios futuros para procesar el pago.');
            return;
        }
        
        // Convertir diferencia a horas
        const diferenciaHoras = menorDiferencia / (1000 * 60 * 60);
        
        console.log(`Horas restantes: ${diferenciaHoras.toFixed(2)}`);
        
        // Verificar si faltan menos de 48 horas
        if (diferenciaHoras < 48) {
            alert('Faltan menos de 48hs. Debe pagar en efectivo.');
            return;
        }
        
        // Si todo está bien, proceder al pago con tarjeta
        setVistaActual('tarjeta');
    };

    const volverACarrito = () => {
        setVistaActual('carrito');
    };

    // Funciones del formulario de tarjeta
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];

        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }

        if (parts.length) {
            return parts.join(' ');
        } else {
            return v;
        }
    };

    const formatExpiryDate = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            return v.substring(0, 2) + '/' + v.substring(2, 4);
        }
        return v;
    };

    const handleCardNumberChange = (e) => {
        const formatted = formatCardNumber(e.target.value);
        handleInputChange('cardNumber', formatted);
    };

    const handleExpiryChange = (e) => {
        const formatted = formatExpiryDate(e.target.value);
        handleInputChange('expiryDate', formatted);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            console.log('Procesando pago...', formData);
            console.log('Carrito seleccionado:', carritoSeleccionado);
            console.log('Fecha seleccionada para el pago:', fechaSeleccionada);

            // Aquí simularías el procesamiento del pago
            // Por ahora, asumimos que el pago fue exitoso

            // Actualizar el estado del carrito a "Pagado"
            if (carritoSeleccionado && carritoSeleccionado.id) {
                await actualizarEstadoCarrito(carritoSeleccionado.id, 'Pagado');
                console.log('Estado del carrito actualizado a "Pagado"');

                // ✅ Mostrar mensaje de éxito SIN cerrar el modal principal aún
                setMostrarModalExito(true);

                // Opcional: Recargar los carritos para actualizar la vista
                // obtenerCarritosPorFecha();
            } else {
                throw new Error('No se pudo identificar el carrito para actualizar');
            }

        } catch (error) {
            console.error('Error al procesar el pago:', error);
            alert('Error al procesar el pago. Por favor, intenta nuevamente.');
        }
    };

    const cerrarModalExito = () => {
        setMostrarModalExito(false);
        onClose(); // ✅ Cerrar el modal principal solo cuando se cierra el modal de éxito
    };

    const imprimirComprobante = () => {
        const ventanaImpresion = window.open('', '_blank');
        const fechaActual = new Date().toLocaleDateString('es-AR');
        const horaActual = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

        const contenidoComprobante = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Comprobante de Pago - Reserva #${carritoSeleccionado?.id || '-'}</title>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f8f9fa;
                    color: #333;
                }
                .comprobante {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                    overflow: hidden;
                }
                .header {
                    background: linear-gradient(135deg, #4A3D3D 0%, #6B5B5B 100%);
                    color: white;
                    padding: 30px 25px;
                    text-align: center;
                }
                .header h1 {
                    margin: 0;
                    font-size: 28px;
                    font-weight: bold;
                    letter-spacing: 1px;
                }
                .header .subtitle {
                    margin: 8px 0 0 0;
                    font-size: 14px;
                    opacity: 0.9;
                }
                .content {
                    padding: 25px;
                }
                .seccion {
                    margin-bottom: 25px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid #e9ecef;
                }
                .seccion:last-child {
                    border-bottom: none;
                    margin-bottom: 0;
                }
                .seccion h3 {
                    color: #4A3D3D;
                    font-size: 16px;
                    margin: 0 0 12px 0;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-weight: 600;
                }
                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                    margin-bottom: 15px;
                }
                .info-item {
                    display: flex;
                    flex-direction: column;
                }
                .info-label {
                    font-size: 12px;
                    color: #666;
                    text-transform: uppercase;
                    margin-bottom: 4px;
                    font-weight: 500;
                }
                .info-value {
                    font-size: 14px;
                    color: #333;
                    font-weight: 600;
                }
                .servicio-item {
                    background: #f8f9fa;
                    border-radius: 8px;
                    padding: 15px;
                    margin-bottom: 12px;
                    border-left: 4px solid #4A3D3D;
                }
                .servicio-titulo {
                    font-weight: 600;
                    color: #4A3D3D;
                    font-size: 15px;
                    margin-bottom: 8px;
                }
                .servicio-detalle {
                    font-size: 13px;
                    color: #666;
                    margin-bottom: 4px;
                }
                .servicio-precio {
                    font-weight: 600;
                    color: #28a745;
                    font-size: 14px;
                    text-align: right;
                    margin-top: 8px;
                }
                .totales {
                    background: #f8f9fa;
                    border-radius: 8px;
                    padding: 20px;
                    margin-top: 20px;
                }
                .total-item {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                    font-size: 14px;
                }
                .total-final {
                    display: flex;
                    justify-content: space-between;
                    font-size: 18px;
                    font-weight: bold;
                    color: #4A3D3D;
                    border-top: 2px solid #4A3D3D;
                    padding-top: 12px;
                    margin-top: 12px;
                }
                .descuento {
                    color: #28a745;
                    font-weight: 600;
                }
                .footer {
                    background: #f8f9fa;
                    padding: 20px 25px;
                    text-align: center;
                    color: #666;
                    font-size: 12px;
                    line-height: 1.5;
                }
                .estado-aprobado {
                    background: #d4edda;
                    color: #155724;
                    padding: 12px;
                    border-radius: 6px;
                    text-align: center;
                    font-weight: 600;
                    margin-bottom: 20px;
                    border: 1px solid #c3e6cb;
                }
                @media print {
                    body { background: white; }
                    .comprobante { box-shadow: none; }
                }
            </style>
        </head>
        <body>
            <div class="comprobante">
                <div class="header">
                    <h1>COMPROBANTE DE PAGO</h1>
                    <div class="subtitle">Spa "Sentirse Bien"</div>
                </div>
                
                <div class="content">
                    <div class="estado-aprobado">
                        ✓ PAGO APROBADO EXITOSAMENTE
                    </div>
                    
                    <div class="seccion">
                        <h3>Información de la Reserva</h3>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">N° de Reserva</span>
                                <span class="info-value">#${carritoSeleccionado?.id || '-'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Fecha del Pago</span>
                                <span class="info-value">${fechaActual} - ${horaActual}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Cliente</span>
                                <span class="info-value">${formData.cardholderName || 'No especificado'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Método de Pago</span>
                                <span class="info-value">Tarjeta de Débito</span>
                            </div>
                        </div>
                    </div>

                    <div class="seccion">
                        <h3>Servicios Contratados</h3>
                        ${servicios.map((servicio, index) => `
                            <div class="servicio-item">
                                <div class="servicio-titulo">${index + 1}. ${servicio.tipo}</div>
                                <div class="servicio-detalle"><strong>Fecha:</strong> ${servicio.fecha} a las ${servicio.hora}</div>
                                <div class="servicio-detalle"><strong>Profesional:</strong> ${servicio.profesional}</div>
                                ${servicio.duracion ? `<div class="servicio-detalle"><strong>Duración:</strong> ${servicio.duracion} minutos</div>` : ''}
                                ${servicio.comentarios ? `<div class="servicio-detalle"><strong>Comentarios:</strong> ${servicio.comentarios}</div>` : ''}
                                <div class="servicio-precio">${formatearPrecio(servicio.precio)}</div>
                            </div>
                        `).join('')}
                    </div>

                    <div class="seccion">
                        <h3>Resumen de Pago</h3>
                        <div class="totales">
                            <div class="total-item">
                                <span>Subtotal:</span>
                                <span>${formatearPrecio(obtenerSubtotal())}</span>
                            </div>
                            <div class="total-item descuento">
                                <span>Descuento (15% - Pago anticipado):</span>
                                <span>-${formatearPrecio(obtenerSubtotal() * 0.15)}</span>
                            </div>
                            <div class="total-final">
                                <span>TOTAL PAGADO:</span>
                                <span>${formatearPrecio(calcularTotal())}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="footer">
                    <p><strong>¡Gracias por elegir nuestros servicios!</strong></p>
                    <p>Este comprobante es válido como prueba de pago. Guárdalo para futuras referencias.</p>
                    <p>Para consultas o modificaciones, contacta a nuestro centro de atención al cliente.</p>
                    <p>Fecha de emisión: ${fechaActual} ${horaActual}</p>
                </div>
            </div>
        </body>
        </html>
        `;

        ventanaImpresion.document.write(contenidoComprobante);
        ventanaImpresion.document.close();

        // Esperar a que cargue y luego imprimir
        ventanaImpresion.onload = function () {
            setTimeout(() => {
                ventanaImpresion.print();
            }, 100);
        };
    };

    if (!isOpen) return null;

    return (
        <>
            {/* ✅ Modal de éxito renderizado fuera del modal principal */}
            {mostrarModalExito && (
                <div className="modal-exito-overlay">
                    <div className="modal-exito-contenedor">
                        <div className="modal-exito-header"></div>
                        <button className="modal-exito-close" onClick={cerrarModalExito}>X</button>

                        <h2 className="modal-exito-titulo">¡PAGO APROBADO!</h2>

                        <p className="modal-exito-texto">
                            Tu pago fue procesado correctamente. Te enviamos el comprobante a tu e-mail.<br />
                            N° DE RESERVA: #{carritoSeleccionado?.id || '-'}<br />
                            TOTAL ABONADO: {formatearPrecio(calcularTotal())}<br />
                            MÉTODO DE PAGO: TARJETA DE DÉBITO<br />
                            {carritoSeleccionado?.descuento && `DESCUENTO APLICADO: 15%`}
                        </p>

                        <div className="modal-exito-botones">
                            <button
                                className="boton-servicios"
                                onClick={() => window.location.href = 'http://localhost:5173/perfil'}
                            >
                                IR A MIS TURNOS
                            </button>
                            <button className="boton-carrito" onClick={imprimirComprobante}>
                                VER COMPROBANTE
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal principal del carrito */}
            <div className="modal-overlay">
                <div className="carrito-modal">
                    {vistaActual === 'carrito' ? (
                        // VISTA DEL CARRITO
                        <>
                            {/* Header */}
                            <div className="modal-header">
                                <h2 className="modal-title">CARRITO DE RESERVAS</h2>
                                <button className="close-button" onClick={onClose}>
                                    <X size={20} color="#F4F8E6" />
                                </button>
                            </div>

                            {/* Selector de Fecha */}
                            <FechaSelector
                                idCliente={idCliente}
                                fechaSeleccionada={fechaSeleccionada}
                                onFechaChange={handleFechaChange}
                            />

                            {/* Lista de Servicios */}
                            <div className="servicios-lista">
                                {error && (
                                    <div className="error-message">
                                        {error}
                                    </div>
                                )}

                                {loading && (
                                    <div className="loading-message">
                                        Cargando servicios...
                                    </div>
                                )}

                                {!loading && !error && fechaSeleccionada && servicios.length > 0 ? (
                                    servicios.map((servicio, index) => (
                                        <div key={servicio.id} className="servicio-item">
                                            <div className="servicio-numero">{index + 1}.</div>
                                            <div className="servicio-content">
                                                <div className="servicio-tipo">{servicio.tipo}</div>
                                                <div className="servicio-detalles">
                                                    <div>Fecha: {servicio.fecha} - Hora: {servicio.hora}</div>
                                                    <div>Profesional: {servicio.profesional}</div>
                                                    {servicio.duracion && (
                                                        <div>Duración: {servicio.duracion} minutos</div>
                                                    )}
                                                    <div className="servicio-precio">
                                                        Precio: {formatearPrecio(servicio.precio)}
                                                    </div>
                                                    {servicio.comentarios && (
                                                        <div className="servicio-comentarios">
                                                            Comentarios: {servicio.comentarios}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : !loading && !error && fechaSeleccionada && servicios.length === 0 ? (
                                    <div className="empty-message">
                                        No se encontraron servicios para esta fecha
                                    </div>
                                ) : !loading && !error && !fechaSeleccionada ? (
                                    <div className="select-date-message">
                                        Selecciona una fecha para ver los servicios
                                    </div>
                                ) : null}
                            </div>

                            <div className="separador"></div>

                            {/* Total y Botón */}
                            <div className="footer-section">
                                <div className="total-section">
                                    <div className="total-text">
                                        SUBTOTAL: <span className="total-precio">
                                            {carritoSeleccionado ? formatearPrecio(obtenerSubtotal()) : '$0'}
                                        </span>
                                    </div>
                                    {carritoSeleccionado && obtenerSubtotal() > 0 && (
                                        <div className="descuento-text">
                                            Total con descuento (15%): <span className="descuento-precio">
                                                {formatearPrecio(calcularTotal())}
                                            </span>
                                        </div>
                                    )}
                                    <div className='buttons-container'>
                                        <button
                                            className="pago-efectivo-button"
                                            onClick={onClose}
                                        >
                                            PAGO EN EFECTIVO
                                        </button>
                                        <button
                                            className="pagar-button"
                                            onClick={irAPagoTarjeta}
                                            disabled={!carritoSeleccionado || obtenerSubtotal() === 0 || loading}
                                        >
                                            IR A PAGAR CON TARJETA
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        // VISTA DEL MODAL DE PAGO CON TARJETA
                        <>
                            {/* Header */}
                            <div className="modal-header-tarjeta">
                                <button
                                    onClick={volverACarrito}
                                    className="close-button"
                                    aria-label="Volver atrás"
                                >
                                    <ArrowLeft size={20} />
                                </button>
                                <h2 className="modal-title">AÑADIR TARJETA</h2>
                                <button
                                    onClick={onClose}
                                    className="close-button"
                                    aria-label="Cerrar"
                                >
                                    <X size={20} color="#F4F8E6" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="tarjeta-content">
                                <p className="tarjeta-descripcion">
                                    Sólo tarjeta de débito en un solo pago.
                                </p>

                                <div className="tarjeta-separador"></div>

                                <div>
                                    {/* Nombre del titular */}
                                    <div className="input-group">
                                        <label className="input-label">Nombre del titular:</label>
                                        <div className="input-wrapper">
                                            <input
                                                type="text"
                                                value={formData.cardholderName}
                                                onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                                                placeholder="Como figura en la tarjeta."
                                                className="card-input full-width"
                                            />
                                        </div>
                                    </div>

                                    {/* Número de tarjeta */}
                                    <div className="input-group">
                                        <label className="input-label">Número de la tarjeta:</label>
                                        <div className="input-wrapper">
                                            <input
                                                type="text"
                                                value={formData.cardNumber}
                                                onChange={handleCardNumberChange}
                                                placeholder="0000 0000 0000 0000"
                                                maxLength="19"
                                                className="card-input full-width"
                                            />
                                        </div>
                                    </div>

                                    {/* Fecha y CVV */}
                                    <div className="input-row">
                                        <div className="input-group half-width">
                                            <label className="input-label">Fecha de vencimiento:</label>
                                            <div className="input-wrapper">
                                                <input
                                                    type="text"
                                                    value={formData.expiryDate}
                                                    onChange={handleExpiryChange}
                                                    placeholder="MM/AA"
                                                    maxLength="5"
                                                    className="card-input"
                                                />
                                            </div>
                                        </div>

                                        <div className="input-group half-width">
                                            <label className="input-label">CVV:</label>
                                            <div className="input-wrapper">
                                                <input
                                                    type="text"
                                                    value={formData.cvv}
                                                    onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, '').substring(0, 3))}
                                                    placeholder="***"
                                                    maxLength="3"
                                                    className="card-input"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Total y botón de pago */}
                                    <div className="pago-footer">
                                        <div className="total-pago">
                                            TOTAL: {carritoSeleccionado ? formatearPrecio(calcularTotal()) : '$0'}
                                        </div>

                                        <div className="pago-final-section">
                                            <p className="descuento-info">
                                                *Descuento del 15% aplicado por pagar con más de 48 hs. de anticipación.
                                            </p>
                                            <button type="button" onClick={handleSubmit} className="pay-btn">
                                                PAGAR
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default CarritoCompleto;