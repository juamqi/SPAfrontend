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

    // Función para obtener carritos del cliente y organizarlos por fecha
    const obtenerCarritosPorFecha = async () => {
        if (!idCliente) return;

        try {
            const response = await fetch(`https://spabackend-production-e093.up.railway.app/api/carritos/cliente/${idCliente}`);

            if (!response.ok) {
                if (response.status === 404) {
                    setCarritosPorFecha(new Map());
                    return;
                }
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const carritos = await response.json();

            // Filtrar carritos pendientes y organizarlos por fecha
            const carritosPendientes = carritos.filter(carrito =>
                carrito.estado === 'Pendiente'
            );

            // Crear un Map con fecha como key y array de carritos como value
            const carritosPorFechaMap = new Map();
            carritosPendientes.forEach(carrito => {
                const fecha = carrito.fecha;
                if (!carritosPorFechaMap.has(fecha)) {
                    carritosPorFechaMap.set(fecha, []);
                }
                carritosPorFechaMap.get(fecha).push(carrito);
            });

            setCarritosPorFecha(carritosPorFechaMap);

        } catch (error) {
            console.error('Error al obtener carritos por fecha:', error);
            setError('Error al cargar carritos');
        }
    };

    // Función para obtener turnos de un carrito específico
    const obtenerTurnosCarrito = async (idCarrito) => {
        if (!idCarrito) return;

        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`https://spabackend-production-e093.up.railway.app/api/carritos/${idCarrito}/turnos`);

            if (!response.ok) {
                if (response.status === 404) {
                    setServicios([]);
                    return;
                }
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const turnos = await response.json();

            // Transformar los datos del backend al formato esperado por el frontend
            const serviciosFormateados = turnos.map(turno => ({
                id: turno.id_turno,
                tipo: turno.servicio_nombre,
                fecha: formatearFecha(turno.fecha_hora),
                hora: formatearHora(turno.fecha_hora),
                profesional: turno.profesional_nombre,
                precio: turno.servicio_precio || 0,
                duracion: turno.duracion_minutos,
                estado: turno.estado,
                comentarios: turno.comentarios
            }));

            setServicios(serviciosFormateados);

        } catch (error) {
            console.error('Error al obtener turnos del carrito:', error);
            setError('Error al cargar los servicios del carrito');
            setServicios([]);
        } finally {
            setLoading(false);
        }
    };

    // Función para manejar cambio de fecha
    const handleFechaChange = (nuevaFecha) => {
        setFechaSeleccionada(nuevaFecha);
        console.log('Fecha seleccionada:', nuevaFecha);

        // Obtener carritos de esa fecha
        const carritosDeEsteFecha = carritosPorFecha.get(nuevaFecha) || [];

        if (carritosDeEsteFecha.length > 0) {
            // Por ahora tomamos el primer carrito de la fecha
            // Podrías implementar lógica para manejar múltiples carritos por fecha
            const primerCarrito = carritosDeEsteFecha[0];
            setCarritoSeleccionado(primerCarrito);
            obtenerTurnosCarrito(primerCarrito.id);
        } else {
            setCarritoSeleccionado(null);
            setServicios([]);
        }
    };

    // Función para formatear fecha desde timestamp a string
    const formatearFecha = (fechaHora) => {
        const fecha = new Date(fechaHora);
        const año = fecha.getFullYear();
        const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const dia = fecha.getDate().toString().padStart(2, '0');
        return `${año}/${mes}/${dia}`;
    };

    // Función para formatear hora desde timestamp
    const formatearHora = (fechaHora) => {
        const fecha = new Date(fechaHora);
        const horas = fecha.getHours().toString().padStart(2, '0');
        const minutos = fecha.getMinutes().toString().padStart(2, '0');
        return `${horas}:${minutos}`;
    };

    // Cargar carritos cuando se abre el modal o cambia el cliente
    useEffect(() => {
        if (isOpen && idCliente) {
            obtenerCarritosPorFecha();
        }
    }, [isOpen, idCliente]);

    // Limpiar estados cuando se cierra el modal
    useEffect(() => {
        if (!isOpen) {
            setFechaSeleccionada(null);
            setCarritoSeleccionado(null);
            setServicios([]);
            setVistaActual('carrito');
            setError(null);
            setMostrarModalExito(false); // ✅ Limpiar también el modal de éxito
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

// Opcional: También puedes agregar esta función helper para debugging
const mostrarTiempoRestante = () => {
    if (!servicios || servicios.length === 0) return;
    
    const ahora = new Date();
    
    servicios.forEach((servicio, index) => {
        const fechaHoraServicio = new Date(`${servicio.fecha}T${servicio.hora}`);
        const diferenciaHoras = (fechaHoraServicio - ahora) / (1000 * 60 * 60);
        
        console.log(`Servicio ${index + 1} (${servicio.tipo}): ${diferenciaHoras.toFixed(2)} horas restantes`);
    });
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
                <div className="modal-exito-overlay" style={{ zIndex: 10000 }}>
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
                                    <div style={{
                                        padding: '20px',
                                        textAlign: 'center',
                                        color: '#e74c3c',
                                        backgroundColor: '#ffeaea',
                                        border: '1px solid #f5c6cb',
                                        borderRadius: '4px',
                                        margin: '10px'
                                    }}>
                                        {error}
                                    </div>
                                )}

                                {loading && (
                                    <div style={{
                                        padding: '20px',
                                        textAlign: 'center',
                                        color: '#666',
                                        fontStyle: 'italic'
                                    }}>
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
                                                        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                                            Comentarios: {servicio.comentarios}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : !loading && !error && fechaSeleccionada && servicios.length === 0 ? (
                                    <div style={{
                                        padding: '20px',
                                        textAlign: 'center',
                                        color: '#666',
                                        fontStyle: 'italic'
                                    }}>
                                        No se encontraron servicios para esta fecha
                                    </div>
                                ) : !loading && !error && !fechaSeleccionada ? (
                                    <div style={{
                                        padding: '20px',
                                        textAlign: 'center',
                                        color: '#666',
                                        fontStyle: 'italic'
                                    }}>
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
                                        <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                                            Total con descuento (15%): <span style={{ fontWeight: 'bold', color: '#4A3D3D' }}>
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
                            <div className="modal-header" style={{ background: '#4A3D3D', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 13px' }}>
                                <button
                                    onClick={volverACarrito}
                                    className="close-button"
                                    aria-label="Volver atrás"
                                    style={{ color: '#F4F8E6' }}
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
                            <div style={{ padding: '24px 26px', height: 'calc(100% - 50px)', display: 'flex', flexDirection: 'column' }}>
                                <p style={{ fontWeight: 500, fontSize: '16px', lineHeight: '24px', color: '#4A3D3D', margin: '0 0 20px 0' }}>
                                    Sólo tarjeta de débito en un solo pago.
                                </p>

                                <div style={{ width: '100%', height: '1px', background: '#D8DEC3', marginBottom: '20px' }}></div>

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
                                    <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                                        <div style={{ fontWeight: 600, fontSize: '16px', lineHeight: '24px', textAlign: 'center', color: '#4A3D3D', marginBottom: '20px' }}>
                                            TOTAL: {carritoSeleccionado ? formatearPrecio(calcularTotal()) : '$0'}
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '20px' }}>
                                            <p style={{ flex: 1, fontWeight: 600, fontSize: '10px', lineHeight: '16px', color: '#4A3D3D', margin: 0, textAlign: 'left' }}>
                                                *Descuento del 15% aplicado por pagar con más de 48 hs. de anticipación.
                                            </p>
                                            {/* ✅ Cambiado onClick para usar handleSubmit */}
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