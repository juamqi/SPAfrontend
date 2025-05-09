import React from 'react';
import '../../styles/sobre-nosotros.css';
import { Heart, Award, Users } from 'lucide-react';

const SobreNosotros = () => {
  return (
    <section className="sobre-nosotros-section" id="sobre-nosotros">
      <div className="sobre-nosotros-overlay"></div>

      <div className="sobre-nosotros-container">
        <div className="sobre-nosotros-content-wrapper">
          {/* Columna izquierda con texto */}
          <div className="sobre-nosotros-text">
            <h2 className="section-title">Sobre nosotros</h2>

            <p className="section-description">
              En nuestro spa, nos dedicamos a proporcionar una experiencia de relajación
              y bienestar incomparable. Con más de 10 años de experiencia en el sector,
              nuestro equipo de profesionales está capacitado para ofrecer los mejores
              servicios de masajes, tratamientos faciales y corporales.
            </p>

            <div className="features-grid">
              <div className="feature-item">
                <div className="feature-icon">
                  <Heart size={24} />
                </div>
                <div className="feature-text">
                  <h3>Cuidado a medida</h3>
                  <p>Tratamientos diseñados exclusivamente para tus necesidades</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  <Award size={24} />
                </div>
                <div className="feature-text">
                  <h3>Profesionales certificados</h3>
                  <p>Expertos con años de experiencia y formación continua</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  <Users size={24} />
                </div>
                <div className="feature-text">
                  <h3>Atención personalizada</h3>
                  <p>Servicio exclusivo con atención a los detalles</p>
                </div>
              </div>
            </div>

            <div className="sobre-nosotros-buttons">
              <a href="#servicios" className="hero-button primary">Nuestros servicios</a>
              <a href="#contacto" className="hero-button outline">Contactanos</a>
            </div>
          </div>

          {/* Columna derecha con imágenes */}
          <div className="sobre-nosotros-gallery">
            <div className="gallery-main">
              <img
                src="https://www.massalagros.com/wp-content/uploads/2023/03/tratamientos-spa2_optimized-2500x1669.jpg"
                className="gallery-image main-image"
              />
            </div>
            <div className="gallery-secondary">
              <img
                src="https://www.korusgroup.com/wp-content/uploads/2023/02/spa-entertainment-facility-korus.jpg"
                className="gallery-image secondary-image"
              />
              <img
                src="https://13c691c772dde5725438-38060db131919a164441ab7fe86cefe0.ssl.cf1.rackcdn.com/u/new-folder-1/delight-with-our-extensive-spa-treatments.jpg"
                className="gallery-image secondary-image"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SobreNosotros;