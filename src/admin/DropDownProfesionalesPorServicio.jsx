import React, { useEffect, useState } from 'react';

const DropdownProfesionalesPorServicio = ({ idServicio, value, onChange }) => {
  const [profesionales, setProfesionales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar profesionales filtrados por id_servicio
  useEffect(() => {
    if (!idServicio) return;

    const fetchProfesionales = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`https://spabackend-production-e093.up.railway.app/api/profesionalesAdm/servicio/${idServicio}`);
        if (!response.ok) {
          throw new Error('Error al cargar los profesionales');
        }
        const data = await response.json();
        setProfesionales(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfesionales();
  }, [idServicio]);

  if (!idServicio) return <div>Seleccione un servicio primero</div>;
  if (loading) return <div>Cargando profesionales...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <label htmlFor="profesional">Selecciona un profesional</label>
      <select
        id="profesional"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Seleccione un profesional</option>
        {profesionales.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nombre} {p.apellido}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DropdownProfesionalesPorServicio;
