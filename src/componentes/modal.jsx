import React, { useState, useEffect } from 'react';
import '../styles/modal.css';
import ModalReserva from './modalReserva.jsx';

const Modal = ({ servicio, onClose }) => {
  const [opcionSeleccionada, setOpcionSeleccionada] = useState(null);
  const [mostrarModalReserva, setMostrarModalReserva] = useState(false);

  useEffect(() => {
    setOpcionSeleccionada(null);
    setMostrarModalReserva(false);
  }, [servicio]);

  useEffect(() => {
    console.log("Servicio recibido en Modal:", servicio);
  }, [servicio]);

  useEffect(() => {
  if (servicio) {
    document.body.classList.add('modal-open');
  } else {
    document.body.classList.remove('modal-open');
  }

  return () => {
    document.body.classList.remove('modal-open');
  };
}, [servicio]);

  if (!servicio) return null;

  const handleSeleccion = (opcion) => {
    console.log("Opción seleccionada:", opcion);
    setOpcionSeleccionada(opcion);
  };

  const handleReservar = () => {
    if (servicio.options && !opcionSeleccionada) {
      alert("Por favor seleccioná una opción primero.");
      return;
    }
    setMostrarModalReserva(true);
  };

  const handleReservaConfirmada = (detallesReserva) => {
    console.log('Reserva confirmada:', detallesReserva);
  };

  if (mostrarModalReserva) {
    let servicioIdToPass;
    if (opcionSeleccionada && opcionSeleccionada.id_servicio) {
      servicioIdToPass = opcionSeleccionada.id_servicio;
      console.log("Pasando ID de servicio de la opción:", servicioIdToPass);
    }
    else if (servicio.id_servicio) {
      servicioIdToPass = servicio.id_servicio;
      console.log("Pasando ID de servicio directo:", servicioIdToPass);
    }
    else if (servicio.id) {
      servicioIdToPass = servicio.id;
      console.log("Pasando ID general:", servicioIdToPass);
    }
    return (
      <ModalReserva
        servicio={servicio}
        opcionSeleccionada={opcionSeleccionada}
        servicioId={servicioIdToPass}
        onClose={() => {
          setMostrarModalReserva(false);
          onClose();
        }}
        onReservaConfirmada={handleReservaConfirmada}
      />
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Etiqueta superior con título */}
        <div className="modal-header">
          <h2 className="modal-title">{servicio.title}</h2>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="modal-image-container">
            <img
              src={servicio.imageSrc}
              alt={servicio.title}
              className="modal-img"
            />
          </div>

          <div className="modal-details">
            <div className="modal-content-area">
              {servicio.options ? (
                <>
                  <h5 className="modal-subtitle">Seleccione un servicio para conocer más.</h5>
                  <ul className="modal-options-list">
                    {servicio.options.map((option, index) => (
                      <li
                        key={index}
                        className={`modal-option-selectable ${opcionSeleccionada === option ? 'selected' : ''}`}
                        onClick={() => handleSeleccion(option)}
                      >
                        {option.nombre}

                        {opcionSeleccionada === option && (
                          <div className="modal-opcion-detalles">
                            <p><strong>Descripción:</strong> {option.descripcion}</p>
                            <p><strong>Precio:</strong> ${option.precio}</p>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <div className="modal-description">
                  <p><strong>Descripción:</strong> {servicio.descripcion}</p>
                  <p><strong>Precio:</strong> ${servicio.precio}</p>
                </div>
              )}
            </div>

            <div className="modal-button-container">
              <button className="modal-reservar-btn" onClick={handleReservar}>
                RESERVAR
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;