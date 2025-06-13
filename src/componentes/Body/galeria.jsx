import React from 'react';
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import slide1 from '../../assets/slide1.jpg';
import slide2 from '../../assets/slide2.jpg';
import slide3 from '../../assets/slide3.jpg';
import slide4 from '../../assets/slide4.jpg';
import slide5 from '../../assets/slide5.jpg';
import '../../styles/galeria.css';

const images = [
  {
    original: slide1,
    thumbnail: slide1,
  },
  {
    original: slide2,
    thumbnail: slide2,
  },
  {
    original: slide3,
    thumbnail: slide3,
  },
  {
    original: slide4,
    thumbnail: slide4,
  },
  {
    original: slide5,
    thumbnail: slide5,
  }
];

const Galeria = () => {
  const galleryOptions = {
    showPlayButton: true,
    showFullscreenButton: true,
    slideInterval: 4000,
    slideDuration: 450,
    showNav: true,
    showBullets: true,
    autoPlay: true
  };

  return (
    <section className="galeria-section" id="galeria">
      <div className="galeria-overlay"></div>
      <div className="galeria-container">
        <div className="galeria-two-column">
          <div className="galeria-column galeria-main">
            <div className="galeria-content">
              <ImageGallery 
                items={images} 
                {...galleryOptions}
                additionalClass="custom-gallery"
              />
            </div>
          </div>
          <div className="galeria-column galeria-info">
            <div className="galeria-text-content">
              <h2 className="section-title">galería</h2>
              <p className="galeria-description">
                Descubre nuestras instalaciones y servicios a través de imágenes.
              </p>
              <p className="galeria-additional-text">
                Cada imagen captura la esencia de nuestro spa, donde la armonía, la tranquilidad y el cuidado están presentes en cada detalle. Nos enorgullece ofrecer un ambiente donde podrás escapar del estrés cotidiano y sumergirte en una experiencia de bienestar total.
              </p>
              <div className="galeria-buttons">
                <a href="#contacto" className="hero-button primary">¡CONTACTANOS!</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Galeria;