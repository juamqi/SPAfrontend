import React from 'react';
import '../../styles/hero.css';
import img from '../../assets/fondohero.jpg';

function Hero() {
  return (
    <section
      className="hero-section"
      id="inicio"
      style={{ backgroundImage: `url(${img})` }}
    >
      <div className="hero-overlay">
        <div className='hero-container'>
          <div className="hero-content">
            <h1 className="hero-title">
              renueva tu cuerpo,<br />calma tu mente
            </h1>
            <p className="hero-subtitle">
              Descubre el equilibrio perfecto<br />
              entre bienestar y serenidad.
            </p>
            <div className="hero-buttons">
              <a href="#servicios" className="hero-button primary">SERVICIOS</a>
              <a href="#contacto" className="hero-button outline">¡CONTACTANOS!</a>
            </div>
          </div>
        </div>
      </div>

      <div className="scroll-indicator">
        <span>DESCUBRE MÁS</span>
        <div className="scroll-arrow"></div>
      </div>
    </section>
  );
}

export default Hero;