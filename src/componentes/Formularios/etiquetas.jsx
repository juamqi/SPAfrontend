import React from 'react';
import '../../styles/etiqueta.css';

const Etiqueta = ({ 
  text = 'Usuario', 
  fontSize = '16px',
  textColor = 'white',
  padding = '6px 12px',
  borderRadius = '4px',
  className = '',
  onClick,
  ...rest
}) => {
  const tagStyle = {
    fontSize,
    color: textColor,
    padding,
    borderRadius
  };

  return (
    <div 
      className={`user-tag ${className}`} 
      style={tagStyle}
      onClick={onClick}
      {...rest}
    >
      {text}
    </div>
  );
};

export default Etiqueta;