import React from 'react';
import Boton from '../Formularios/boton.jsx';
import '../../styles/popup.css';

const PopupConfirmacion = ({ 
  titulo = 'Confirmar Acción', 
  mensaje = '¿Estás seguro que deseas realizar esta acción?', 
  submensaje = 'Esta acción no se puede deshacer.',
  onConfirmar, 
  onCancelar,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  colorConfirmar = '#c62828',
  hoverColorConfirmar = '#b71c1c',
  colorCancelar = '#757575',
  hoverColorCancelar = '#616161'
}) => {
  return (
    <div className="popup-confirmacion">
      <div className="popup-contenido">
        <h3>{titulo}</h3>
        <p>{mensaje}</p>
        {submensaje && <p>{submensaje}</p>}
        <div className="popup-botones">
          <Boton 
            text={textoConfirmar} 
            onClick={onConfirmar}
            backgroundColor={colorConfirmar}
            hoverBackgroundColor={hoverColorConfirmar}
          />
          <Boton 
            text={textoCancelar} 
            onClick={onCancelar}
            backgroundColor={colorCancelar}
            hoverBackgroundColor={hoverColorCancelar}
          />
        </div>
      </div>
    </div>
  );
};

export default PopupConfirmacion;