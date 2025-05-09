import React, { useState } from 'react';
import Calendar from 'react-calendar';
import '../../styles/Calendario.css';

const Calendario = ({
  turnos = [],
  onDateChange,
  onTurnoClick,
  initialValue,
  backgroundColor,
  ...otrosProps
}) => {
  const [value, setValue] = useState(initialValue || new Date());

  const handleChange = (newValue) => {
    setValue(newValue);

    if (onDateChange) {
      onDateChange(newValue);
    }

    const formatted = formatDate(newValue);
    if (turnos.includes(formatted) && onTurnoClick) {
      onTurnoClick(formatted); // Llama al handler si hay turno ese día
    }
  };

  const formatDate = (date) => {
    const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return offsetDate.toISOString().split('T')[0];
  };

  const hasTurno = (date) => {
    const formatted = formatDate(date);
    return turnos.includes(formatted);
  };

  return (
    <div className="custom-calendar-container" style={{ '--background-color': backgroundColor }}>
      <Calendar
        onChange={handleChange}
        value={value}
        tileClassName={({ date, view }) => {
          if (view === 'month') {
            return hasTurno(date) ? 'dia-con-turno' : null;
          }
          return null;
        }}
        {...otrosProps}
      />
    </div>
  );
};

export default Calendario;
