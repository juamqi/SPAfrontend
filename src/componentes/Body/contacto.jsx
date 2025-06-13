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

  const { nombre, email, telefono, mensaje } = formData;

  const subject = `Consulta de ${nombre}`;
  const messageText = `Nombre: ${nombre}\nEmail: ${email}\nTeléfono: ${telefono}\nMensaje:\n${mensaje}`;

  try {
    // Enviar al admin
    const sendRes = await fetch('https://spabackend-production-e093.up.railway.app/api/email/email-send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: 'info@spasentirsebien.com', // destinatario real
        subject: subject,
        text: messageText,
      }),
    });

    if (!sendRes.ok) throw new Error('Fallo al enviar al admin');

    // Simulación de recepción
    const reciveRes = await fetch('https://spabackend-production-e093.up.railway.app/api/email/email-reciver', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: email,
        subject: `Copia del mensaje de ${nombre}`,
        text: messageText,
      }),
    });

    if (!reciveRes.ok) throw new Error('Fallo al simular recepción');

    // Éxito
    setFormData({ nombre: '', email: '', telefono: '', mensaje: '' });
    setMensaje({
      tipo: 'exito',
      texto: '¡Gracias por tu mensaje! Nos pondremos en contacto contigo pronto.',
    });
    setTimeout(() => setMensaje(null), 5000);
  } catch (error) {
    console.error(error);
    setMensaje({
      tipo: 'error',
      texto: 'Hubo un problema al enviar tu mensaje. Por favor intenta nuevamente.',
    });
  } finally {
    setEnviando(false);
  }
};

  return (
    <div className="page-container">
      <section className="contacto-section" id="contacto">
        <div className="contacto-overlay"></div>
        <div className="contacto-container">
          <div className="contacto-content">
            <div className="contacto-info">
              <div className="contacto-header">
                <h2 className="contacto-title">contacto</h2>
              </div>
              <div className="contacto-details">
                <div className="contacto-detail-item">
                  <span className="contact-icon">
                    <Mail size={20} />
                  </span>
                  <div className="contact-text-group">
                    <span className="contacto-label">e-mail</span>
                    <span className="contacto-value">info@spasentirsebien.com</span>
                  </div>
                </div>
                <div className="contacto-detail-item">
                  <span className="contact-icon">
                    <Phone size={20} />
                  </span>
                  <div className="contact-text-group">
                    <span className="contacto-label">teléfono</span>
                    <span className="contacto-value">+54 362 422-5555</span>
                  </div>
                </div>
                <div className="contacto-detail-item">
                  <span className="contact-icon">
                    <MapPin size={20} />
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
                    className="form-custom-input" />
                </div>

                <div className="form-group">
                  <Input
                    type="email"
                    name="email"
                    placeholder="Tu e-mail"
                    value={formData.email}
                    onChange={handleChange}
                    required={true}
                    className="form-custom-input" />
                </div>

                <div className="form-group">
                  <Input
                    type="tel"
                    name="telefono"
                    placeholder="Tu teléfono"
                    value={formData.telefono}
                    onChange={handleChange}
                    required={true}
                    className="form-custom-input" />
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
                    rows="4" />
                </div>

                {mensaje && (
                  <div className={`mensaje-alerta ${mensaje.tipo}`}>
                    {mensaje.texto}
                  </div>
                )}

                <div className="form-submit">
                  <button
                    type="submit"
                    className="contacto-button"
                    disabled={enviando}
                  >
                    {enviando ? 'Enviando...' : (
                      <>
                        Enviar
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
      
      <footer className="footer">
        <div className="footer-content">
          <p className="footer-text">
            Horarios de atención: Lunes a Sábado, de 9 a 20 hs. <br />
            Formas de pago: Efectivo, transferencia y todas las tarjetas de crédito/débito. <br />
            Equipo de desarrollo de la página: KASS, Juan Pablo. PÉREZ, Simón. SORIA, Nicolás.
          </p>
          <div className="footer-redes">
            <a href="https://instagram.com/spa-ficticio" target="_blank" rel="noopener noreferrer" className="red-circle">
              <Instagram size={24} />
            </a>
            <a href="https://facebook.com/spa-ficticio" target="_blank" rel="noopener noreferrer" className="red-circle">
              <Facebook size={24} />
            </a>
            <a href="https://twitter.com/spa-ficticio" target="_blank" rel="noopener noreferrer" className="red-circle">
              <Twitter size={24} />
            </a>
          </div>
          <p className="footer-copy">SPA "Sentirse Bien" © 2025</p>
        </div>
      </footer>
    </div>
  );
};

export default Contacto;