import React from 'react';
import '../../styles/input.css';

const Input = ({ 
  type = 'text', 
  placeholder = '', 
  value, 
  onChange, 
  name, 
  id,
  className = '',
  disabled = false,
  required = false,
  ...rest
}) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      name={name}
      id={id || name}
      className={`custom-input ${className}`}
      disabled={disabled}
      required={required}
      {...rest}
    />
  );
};

export default Input;