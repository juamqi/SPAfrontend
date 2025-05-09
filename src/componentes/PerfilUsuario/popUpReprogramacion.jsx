import React, { useState } from 'react';
import Calendar from 'react-calendar';
import Boton from '../Formularios/boton.jsx';
import '../../styles/popUpReprogramacion.css';
import 'react-calendar/dist/Calendar.css';

const PopupReprogramacion = ({ 
  titulo = 'Reprogramar Turno', 
  mensaje = 'Selecciona una nueva fecha y hora para tu turno:', 
  turnoActual,
  onConfirmar, 
  onCancelar,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  colorConfirmar = '#1565c0',
  hoverColorConfirmar = '#0d47a1',
  colorCancelar = '#757575',
  hoverColorCancelar = '#616161'
}) => {
  const [nuevaFecha, setNuevaFecha] = useState(new Date());
  const [nuevaHora, setNuevaHora] = useState('');
  
  // Generar horas disponibles (ejemplo: de 8:00 a 18:00 cada 30 min)
  const horasDisponibles = [];
  for (let hora = 8; hora <= 18; hora++) {
    horasDisponibles.push(`${hora.toString().padStart(2, '0')}:00`);
    if (hora < 18) {
      horasDisponibles.push(`${hora.toString().padStart(2, '0')}:30`);
    }
  }

  // Función para manejar la confirmación con los nuevos datos
  const handleConfirmar = () => {
    if (!nuevaHora) {
      alert('Por favor, selecciona una hora para el turno');
      return;
    }
    
    // Crear un objeto con la fecha y hora seleccionadas
    const fechaFormateada = nuevaFecha.toISOString().split('T')[0];
    const datosTurnoReprogramado = {
      fecha: fechaFormateada,
      hora: nuevaHora,
      fechaCompleta: `${fechaFormateada}T${nuevaHora}:00`
    };
    
    onConfirmar(datosTurnoReprogramado);
  };

  // Función para deshabilitar fechas pasadas en el calendario
  const esDateValida = (date) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return date >= hoy;
  };

  return (
    <div className="popup-reprogramacion">
      <div className="popup-contenido">
        <h3>{titulo}</h3>
        <p>{mensaje}</p>
        
        {turnoActual && (
          <div className="turno-actual">
            <p><strong>Turno actual:</strong> {turnoActual.fecha_hora.split('T')[0]} a las {turnoActual.fecha_hora.split('T')[1].substring(0,5)}</p>
          </div>
        )}
        
        <div className="reprogramar-seleccion">
          <div className="reprogramar-calendario">
            <h4>Selecciona una nueva fecha:</h4>
            <Calendar 
              onChange={setNuevaFecha} 
              value={nuevaFecha}
              minDate={new Date()}
              tileDisabled={({date}) => !esDateValida(date)}
              className="mini-calendario"
            />
          </div>
          
          <div className="reprogramar-hora">
            <h4>Selecciona un horario:</h4>
            <div className="horas-grid">
              {horasDisponibles.map(hora => (
                <div 
                  key={hora} 
                  className={`hora-item ${nuevaHora === hora ? 'hora-seleccionada' : ''}`}
                  onClick={() => setNuevaHora(hora)}
                >
                  {hora}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="popup-botones">
          <Boton 
            text={textoConfirmar} 
            onClick={handleConfirmar}
            backgroundColor={colorConfirmar}
            hoverBackgroundColor={hoverColorConfirmar}
            disabled={!nuevaHora}
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

export default PopupReprogramacion;