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
    const iconStyles = "width: 24px; height: 24px; display: block; margin: 0 auto;";
    switch (popup.type) {
      case 'success':
        return `<svg style="${iconStyles}" fill="none" stroke="#10b981" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`;
      case 'error':
        return `<svg style="${iconStyles}" fill="none" stroke="#ef4444" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>`;
      case 'warning':
        return `<svg style="${iconStyles}" fill="none" stroke="#f59e0b" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
      default:
        return `<svg style="${iconStyles}" fill="none" stroke="#06b6d4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
    }
  };

  const overlayStyles = {
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
    zIndex: '2147483647',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    boxSizing: 'border-box',
    opacity: isVisible ? '1' : '0',
    transition: 'opacity 0.3s ease',
    pointerEvents: 'auto',
  };

  const popupStyles = {
    position: 'relative',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
    padding: '32px',
    maxWidth: '420px',
    width: '100%',
    textAlign: 'center',
    transform: isVisible ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(20px)',
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxSizing: 'border-box',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: '16px',
    lineHeight: '1.5',
    color: '#1f2937',
    margin: '0',
    border: 'none',
    outline: 'none',
  };

  const iconContainerStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    margin: '0 auto 24px auto',
    borderRadius: '50%',
    backgroundColor: popup.type === 'success' ? '#ecfdf5' :
                      popup.type === 'error' ? '#fef2f2' :
                      popup.type === 'warning' ? '#fffbeb' : '#f0fdfa',
  };

  const titleStyles = {
    fontSize: '20px',
    fontWeight: '600',
    margin: '0 0 12px 0',
    color: '#111827',
    lineHeight: '1.4',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  };

  const messageStyles = {
    fontSize: '16px',
    margin: '0 0 32px 0',
    color: '#6b7280',
    lineHeight: '1.6',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  };

  const buttonContainerStyles = {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  };

  const getButtonStyles = (isPrimary = true) => ({
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    minWidth: '80px',
    backgroundColor: isPrimary ? 
      (popup.type === 'error' ? '#ef4444' :
       popup.type === 'warning' ? '#f59e0b' :
       popup.type === 'success' ? '#10b981' : '#06b6d4') : '#f3f4f6',
    color: isPrimary ? '#ffffff' : '#374151',
    boxShadow: isPrimary ? '0 1px 2px rgba(0, 0, 0, 0.05)' : 'none',
    ':hover': {
      transform: 'translateY(-1px)',
      boxShadow: isPrimary ? '0 4px 12px rgba(0, 0, 0, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
    }
  });

  const closeButtonStyles = {
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: 'transparent',
    border: 'none',
    fontSize: '24px',
    color: '#9ca3af',
    cursor: 'pointer',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    ':hover': {
      backgroundColor: '#f3f4f6',
      color: '#6b7280',
    }
  };

  return (
    <div style={overlayStyles} onClick={popup.type !== 'confirm' ? handleClose : undefined}>
      <div style={popupStyles} onClick={(e) => e.stopPropagation()}>
        {/* Ícono */}
        <div style={iconContainerStyles}>
          <div dangerouslySetInnerHTML={{ __html: getIcon() }} />
        </div>

        {/* Título */}
        {popup.title && (
          <h3 style={titleStyles}>
            {popup.title}
          </h3>
        )}

        {/* Mensaje */}
        <p style={messageStyles}>{popup.message}</p>

        {/* Botones */}
        <div style={buttonContainerStyles}>
          {popup.type === 'confirm' && popup.showCancel && (
            <button
              onClick={handleCancel}
              style={getButtonStyles(false)}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#e5e7eb';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#f3f4f6';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              {popup.cancelText}
            </button>
          )}

          <button
            onClick={handleConfirm}
            style={getButtonStyles(true)}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
            }}
          >
            {popup.confirmText}
          </button>
        </div>

        {/* Botón cerrar */}
        {popup.type !== 'confirm' && (
          <button
            onClick={handleClose}
            style={closeButtonStyles}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f3f4f6';
              e.target.style.color = '#6b7280';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#9ca3af';
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
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      zIndex: 2147483647, 
      pointerEvents: 'none' 
    }}>
      {popups.map(popup => (
        <div key={popup.id} style={{ pointerEvents: 'auto' }}>
          <Popup popup={popup} onClose={onClose} />
        </div>
      ))}
    </div>,
    document.body
  );
};