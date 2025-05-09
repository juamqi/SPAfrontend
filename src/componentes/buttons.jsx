import React from 'react';
import '../styles/buttons.css';

const Button = ({ children, onClick, type = 'button', className = '' }) => {
  return (
    <button className={`spa-button ${className}`} type={type} onClick={onClick}>
      {children}
    </button>
    //probando github por que no me anda aaaaaaaaaaaaaaaaaaaaaa
  );
};

export default Button;