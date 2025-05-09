import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, Facebook, Instagram, Twitter } from 'lucide-react';
import Input from '../Formularios/input.jsx';
import '../../styles/contacto.css';

const Contacto = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    mensaje: ''
  });

  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);

    // Simulando un envío de formulario con retardo
    try {
      // Aquí iría la lógica real de envío al backend
      await new Promise(resolve => setTimeout(resolve, 1500));

      console.log('Formulario enviado:', formData);
      setFormData({ nombre: '', email: '', telefono: '', mensaje: '' });
      setMensaje({
        tipo: 'exito',
        texto: '¡Gracias por tu mensaje! Nos pondremos en contacto contigo pronto.'
      });

      // Limpiar el mensaje después de 5 segundos
      setTimeout(() => setMensaje(null), 5000);
    } catch (error) {
      setMensaje({
        tipo: 'error',
        texto: 'Hubo un problema al enviar tu mensaje. Por favor intenta nuevamente.'
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section className="contacto-section" id="contacto">
      <div className="contacto-overlay"></div>
      <div className="contacto-container">
        <div className="contacto-content">
          <div className="contacto-info">
            <div className="contacto-header">
              <h2 className="contacto-title">Contacto</h2>
            </div>
            <div className="contacto-details">
              <div className="contacto-detail-item">
                <span className="contact-icon">
                  <Mail size={22} />
                </span>
                <div className="contact-text-group">
                  <span className="contacto-label">e-mail</span>
                  <span className="contacto-value">info@spasentirsebien.com</span>
                </div>
              </div>

              <div className="contacto-detail-item">
                <span className="contact-icon">
                  <Phone size={22} />
                </span>
                <div className="contact-text-group">
                  <span className="contacto-label">teléfono</span>
                  <span className="contacto-value">+54 362 422-5555</span>
                </div>
              </div>

              <div className="contacto-detail-item">
                <span className="contact-icon">
                  <Clock size={22} />
                </span>
                <div className="contact-text-group">
                  <span className="contacto-label">horarios</span>
                  <span className="contacto-value">Lunes a Sábados: 9:00 - 20:00</span>
                </div>
              </div>
              
              <div className="contacto-detail-item">
                <span className="contact-icon">
                  <MapPin size={22} />
                </span>
                <div className="contact-text-group">
                  <span className="contacto-label">dirección</span>
                  <span className="contacto-value">Av. Castelli 150, Resistencia, Chaco</span>
                </div>
              </div>
            </div>

            <div className="contacto-map-container">
              <iframe
                className="contacto-map"
                title="Ubicación del Spa"
                src="https://www.openstreetmap.org/export/embed.html?bbox=-58.99749755859376%2C-27.46270794944356%2C-58.98720788002015%2C-27.45566772429961&amp;layer=mapnik&amp;marker=-27.459187861915857%2C-58.992352719306946"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

            <div className="contacto-footer">
              <p className="contacto-horarios">SPA "Sentirse Bien" © 2025</p>
              <div className="redes-sociales">
                <a href="https://facebook.com/spa-ficticio" target="_blank" rel="noopener noreferrer" className="icono-red">
                  <Facebook size={24} />
                </a>
                <a href="https://instagram.com/spa-ficticio" target="_blank" rel="noopener noreferrer" className="icono-red">
                  <Instagram size={24} />
                </a>
                <a href="https://twitter.com/spa-ficticio" target="_blank" rel="noopener noreferrer" className="icono-red">
                  <Twitter size={24} />
                </a>
              </div>

            </div>
          </div>

          <div className="contacto-form-container">
            <div className="contacto-form-header">
              <h3 className="contacto-form-title">Envianos tu consulta</h3>
              <p className="contacto-form-subtitle">Nos contactaremos a tu e-mail en 24 hs.</p>
            </div>

            <form className="contacto-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <Input
                  type="text"
                  name="nombre"
                  placeholder="Tu nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required={true}
                  className="form-custom-input"
                />
              </div>

              <div className="form-group">
                <Input
                  type="email"
                  name="email"
                  placeholder="Tu e-mail"
                  value={formData.email}
                  onChange={handleChange}
                  required={true}
                  className="form-custom-input"
                />
              </div>

              <div className="form-group">
                <Input
                  type="tel"
                  name="telefono"
                  placeholder="Tu teléfono (opcional)"
                  value={formData.telefono}
                  onChange={handleChange}
                  required={false}
                  className="form-custom-input"
                />
              </div>

              <div className="form-group message-group">
                <Input
                  type="textarea"
                  name="mensaje"
                  placeholder="¿En qué podemos ayudarte?"
                  value={formData.mensaje}
                  onChange={handleChange}
                  required={true}
                  className="form-custom-input textarea"
                  rows="5"
                />
              </div>

              {mensaje && (
                <div className={`mensaje-alerta ${mensaje.tipo}`}>
                  {mensaje.texto}
                </div>
              )}

              <div className="form-submit">
                <button
                  type="submit"
                  className="hero-button"
                  disabled={enviando}
                >
                  {enviando ? 'Enviando...' : (
                    <>
                      Enviar <Send size={16} style={{ marginLeft: '8px' }} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contacto;