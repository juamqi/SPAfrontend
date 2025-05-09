import React from 'react';
import '../../styles/boton.css';

const Boton = ({
  text = 'Iniciar sesión',
  type = 'button',
  onClick,
  disabled = false,
  fontSize = '16px',
  backgroundColor = '#0D47A1',
  hoverBackgroundColor = '#0A3880',
  color = 'white',
  width = 'auto',
  padding = '12px 24px',
  borderRadius = '6px',
  border = 'none',
  className = '',
  fullWidth = false,
  children,
  ...rest
}) => {
  const buttonStyle = {
    fontSize,
    backgroundColor,
    color,
    width: fullWidth ? '100%' : width,
    padding,
    borderRadius,
    border,
    '--hover-bg-color': hoverBackgroundColor,
  };

  return (
    <button
      type={type}
      className={`custom-button ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={buttonStyle}
      {...rest}
    >
      {children || text}
    </button>
  );
};

export default Boton;