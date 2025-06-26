import React, { createContext, useContext } from 'react';
import { usePopup, PopupContainer } from './popup.jsx';

const PopupContext = createContext();

export const PopupProvider = ({ children }) => {
  const { popups, showPopup, closePopup } = usePopup();

  return (
    <PopupContext.Provider value={{ showPopup }}>
      {children}
      <PopupContainer popups={popups} onClose={closePopup} />
    </PopupContext.Provider>
  );
};

export const usePopupContext = () => {
  const context = useContext(PopupContext);
  if (!context) {
    throw new Error('usePopupContext debe usarse dentro de PopupProvider');
  }
  return context;
};