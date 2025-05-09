import React from "react";
import ReactDOM from "react-dom";
import "./ModalForm.css";

const ModalForm = ({ isOpen, onClose, title, children, onSave }) => {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave();
  };
  
  // Usar portal para renderizar el modal directamente en el body
  return ReactDOM.createPortal(
    <div className="modalf-overlay" onClick={onClose}>
      <div className="modalf-content" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <form onSubmit={handleSubmit}>
          <div className="modalf-form-content">
            {children}
          </div>
          <div className="modalf-footer">
            <button type="button" className="btn-cancelar" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-guardar">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body // Renderiza directamente en el body del documento
  );
};

export default ModalForm;