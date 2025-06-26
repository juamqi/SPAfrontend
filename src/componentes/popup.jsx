import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export const usePopup = () => {
  const [popups, setPopups] = useState([]);

  const showPopup = (config) => {
    const id = Date.now() + Math.random();
    const popup = {
      id,
      type: config.type || 'info',
      title: config.title || '',
      message: config.message || '',
      duration: config.duration || 5000,
      onConfirm: config.onConfirm,
      onCancel: config.onCancel,
      showCancel: config.showCancel || false,
      confirmText: config.confirmText || 'Aceptar',
      cancelText: config.cancelText || 'Cancelar',
    };

    setPopups(prev => [...prev, popup]);

    if (popup.duration && popup.type !== 'confirm') {
      setTimeout(() => {
        closePopup(id);
      }, popup.duration);
    }

    return id;
  };

  const closePopup = (id) => {
    setPopups(prev => prev.filter(p => p.id !== id));
  };

  return { popups, showPopup, closePopup };
};

const Popup = ({ popup, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(popup.id), 300);
  };

  const handleConfirm = () => {
    if (popup.onConfirm) popup.onConfirm();
    handleClose();
  };

  const handleCancel = () => {
    if (popup.onCancel) popup.onCancel();
    handleClose();
  };

  const getIcon = () => {
    const iconStyles = "width: 24px; height: 24px";
    switch (popup.type) {
      case 'success':
        return `<svg style="${iconStyles}" fill="none" stroke="green" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>`;
      case 'error':
        return `<svg style="${iconStyles}" fill="none" stroke="red" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>`;
      case 'warning':
        return `<svg style="${iconStyles}" fill="none" stroke="orange" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856"/></svg>`;
      default:
        return `<svg style="${iconStyles}" fill="none" stroke="teal" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01"/></svg>`;
    }
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center transition-all duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        zIndex: 2147483647,
        padding: '1rem',
        fontSize: '16px',
        fontFamily: 'sans-serif',
        pointerEvents: 'auto',
      }}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm"
        style={{ pointerEvents: 'auto' }}
        onClick={popup.type !== 'confirm' ? handleClose : undefined}
      />

      {/* Contenido del popup */}
      <div
        className="popup-reset"
        style={{
          position: 'relative',
          backgroundColor: 'white',
          borderRadius: '1rem',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          padding: '2rem',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center',
          transform: isVisible ? 'scale(1)' : 'scale(0.95)',
          transition: 'transform 0.3s ease',
        }}
      >
        {/* Ícono */}
        <div
          dangerouslySetInnerHTML={{ __html: getIcon() }}
          style={{ marginBottom: '1rem' }}
        />

        {/* Título */}
        {popup.title && (
          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '0.5rem' }}>
            {popup.title}
          </h3>
        )}

        {/* Mensaje */}
        <p style={{ marginBottom: '1.5rem', color: '#555' }}>{popup.message}</p>

        {/* Botones */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          {popup.type === 'confirm' && popup.showCancel && (
            <button
              onClick={handleCancel}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                backgroundColor: '#eee',
                color: '#333',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {popup.cancelText}
            </button>
          )}

          <button
            onClick={handleConfirm}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              backgroundColor: popup.type === 'error'
                ? '#dc2626'
                : popup.type === 'warning'
                ? '#d97706'
                : popup.type === 'success'
                ? '#16a34a'
                : '#0d9488',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {popup.confirmText}
          </button>
        </div>

        {/* Cerrar */}
        {popup.type !== 'confirm' && (
          <button
            onClick={handleClose}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'transparent',
              border: 'none',
              fontSize: '1.25rem',
              color: '#999',
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export const PopupContainer = ({ popups, onClose }) => {
  if (popups.length === 0) return null;

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 2147483647, pointerEvents: 'none' }}>
      {popups.map(popup => (
        <div key={popup.id} style={{ pointerEvents: 'auto' }}>
          <Popup popup={popup} onClose={onClose} />
        </div>
      ))}
    </div>,
    document.body
  );
};