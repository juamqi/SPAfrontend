import { useState } from "react";
import "../styles/calendar.css";

export default function CalendarioCustom() {
  const today = new Date();
  const [fechaActual, setFechaActual] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);

  const obtenerDiasDelMes = (fecha) => {
    const dias = [];
    const año = fecha.getFullYear();
    const mes = fecha.getMonth();
    const totalDias = new Date(año, mes + 1, 0).getDate();

    for (let i = 1; i <= totalDias; i++) {
      dias.push(new Date(año, mes, i));
    }

    return dias;
  };

  const cambiarMes = (offset) => {
    const nuevoMes = new Date(fechaActual);
    nuevoMes.setMonth(fechaActual.getMonth() + offset);
    setFechaActual(new Date(nuevoMes.getFullYear(), nuevoMes.getMonth(), 1));
    setDiaSeleccionado(null);
  };

  const dias = obtenerDiasDelMes(fechaActual);
  const nombreMes = fechaActual.toLocaleString("es-ES", {
    month: "long",
    year: "numeric",
  });

  const horarios = {
    mañana: ["08:00", "09:00", "10:00", "11:00", "12:00"],
    tarde: ["13:00", "14:00", "15:00", "16:00", "17:00", "18:00"],
    noche: ["19:00", "20:00", "21:00"],
  };

  return (
    <div className="calendario-custom">
      <h4 className="titulo-seleccion">
        Seleccioná fecha y hora de tu servicio
      </h4>
      <br />
      <div className="encabezado">
        <button onClick={() => cambiarMes(-1)}>←</button>
        <h5>{nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1)}</h5>
        <button onClick={() => cambiarMes(1)}>→</button>
      </div>

      <div className="dias-scroll">
        {dias.map((dia, i) => (
          <div
            className={`dia ${diaSeleccionado?.toDateString() === dia.toDateString()
              ? "seleccionado"
              : ""
              }`}
            key={i}
            onClick={() => setDiaSeleccionado(dia)}
          >
            {dia.getDate()}
          </div>
        ))}
      </div>
      <br />
      {diaSeleccionado && (
        <div className="horarios">
          <h5>
            Horarios disponibles para el{" "}
            {diaSeleccionado.toLocaleDateString("es-ES")}:
          </h5>

          {Object.entries(horarios).map(([turno, horas]) => (
            <div className="bloque-horario" key={turno}>
              <h6>{turno.charAt(0).toUpperCase() + turno.slice(1)}</h6>
              <div className="horarios-lista">
                {horas.map((hora, i) => (
                  <button key={i} className="horario-btn">
                    {hora}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
