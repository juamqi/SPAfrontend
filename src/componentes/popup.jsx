import { useState, useEffect } from 'react';

export const usePopup = () => {
  const [popups, setPopups] = useState([]);

  const showPopup = (config) => {
    const id = Date.now() + Math.random();
    const popup = {
      id,
      type: config.type || 'info',
      title: config.title || '',
      message: config.message || '',
      duration: config.duration || 4000,
      onConfirm: config.onConfirm,
      onCancel: config.onCancel,
      showCancel: config.showCancel || false,
      confirmText: config.confirmText || 'Aceptar',
      cancelText: config.cancelText || 'Cancelar'
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
    setPopups(prev => prev.filter(popup => popup.id !== id));
  };

  return { popups, showPopup, closePopup };
};

const Popup = ({ popup, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);
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
    switch (popup.type) {
      case 'success':
        return (
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        );
      case 'confirm':
        return (
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 transition-all duration-300 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm"
        onClick={popup.type !== 'confirm' ? handleClose : undefined}
      />
      
      {/* Popup Content */}
      <div className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 text-center transform transition-all duration-300 ${
        isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
      }`}>
        {/* Icono */}
        {getIcon()}
        
        {/* Título */}
        {popup.title && (
          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            {popup.title}
          </h3>
        )}
        
        {/* Mensaje */}
        <p className="text-gray-600 mb-6 leading-relaxed">
          {popup.message}
        </p>
        
        {/* Botones */}
        <div className="flex gap-3 justify-center">
          {popup.type === 'confirm' && popup.showCancel && (
            <button
              onClick={handleCancel}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
            >
              {popup.cancelText}
            </button>
          )}
          
          <button
            onClick={handleConfirm}
            className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200 ${
              popup.type === 'error' 
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : popup.type === 'warning'
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : popup.type === 'success'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-teal-600 hover:bg-teal-700 text-white'
            }`}
          >
            {popup.confirmText}
          </button>
        </div>
        
        {/* Botón de cerrar */}
        {popup.type !== 'confirm' && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export const PopupContainer = ({ popups, onClose }) => {
  if (popups.length === 0) return null;

  return (
    <>
      {popups.map(popup => (
        <Popup 
          key={popup.id} 
          popup={popup} 
          onClose={onClose}
        />
      ))}
    </>
  );
};