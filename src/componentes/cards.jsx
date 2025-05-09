import React from 'react';
import '../styles/cards.css';

const Card = ({ title, imageSrc }) => {
  return (
    <div className="section-card">
      {imageSrc && (
        <div className="section-card-image-container">
          <img src={imageSrc} alt={title} className="section-card-image" />
          <div className="section-card-overlay"></div>
        </div>
      )}
      <h3 className="card-title">{title}</h3>
    </div>
  );
}

export default Card;