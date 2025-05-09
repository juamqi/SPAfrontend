import React, { useEffect, useState, useCallback } from 'react';

const DropdownServicios = ({ onChange, value, categoriaId, onServiciosLoaded }) => {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Memoizamos la función notificadora para evitar regeneraciones
  const notifyServiciosLoaded = useCallback((data) => {
    if (onServiciosLoaded && typeof onServiciosLoaded === 'function') {
      onServiciosLoaded(data);
    }
  }, [onServiciosLoaded]);

  // Obtener los servicios según la categoría seleccionada
  useEffect(() => {
    // Solo cargar servicios si hay una categoría seleccionada
    if (!categoriaId) {
      setServicios([]);
      return;
    }

    const fetchServicios = async () => {
      setLoading(true);
      try {
        console.log(`Intentando cargar servicios para categoría: ${categoriaId}`);
        const response = await fetch(`http://localhost:3001/api/serviciosAdm/servicios/categoria/${categoriaId}`);
        
        if (!response.ok) {
          // Mostrar detalles del error para ayudar en el diagnóstico
          const errorText = await response.text();
          console.error(`Error HTTP ${response.status}: ${errorText}`);
          throw new Error(`Error al cargar los servicios (${response.status})`);
        }
        
        const data = await response.json();
        console.log('Servicios cargados:', data);
        setServicios(data);
        
        // Notificar que los servicios se cargaron
        notifyServiciosLoaded(data);
      } catch (err) {
        console.error('Error al cargar servicios:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchServicios();
  }, [categoriaId, notifyServiciosLoaded]); // Solo se ejecuta cuando cambia la categoría o la función notificadora

  // Cuando cambia la categoría, resetear el valor del servicio seleccionado
  useEffect(() => {
    // Solo resetear si:
    // 1. hay una función onChange disponible
    // 2. hay una categoría seleccionada
    // 3. hay un valor actualmente seleccionado (evita actualizaciones innecesarias)
    if (onChange && categoriaId && value) {
      onChange('', '');
    }
  }, [categoriaId]); // Solo se ejecuta cuando cambia la categoría

  // Función para manejar el cambio de servicio
  const handleServicioChange = (e) => {
    const servicioId = e.target.value;
    // Encontrar el nombre del servicio seleccionado
    const servicioSeleccionado = servicios.find(s => s.id_servicio == servicioId);
    const nombreServicio = servicioSeleccionado ? servicioSeleccionado.nombre : '';
    
    // Pasar tanto el ID como el nombre al componente padre
    onChange(servicioId, nombreServicio);
  };

  if (loading) return <div>Cargando servicios...</div>;
  if (error) return <div>Error: {error} - Por favor revisa la consola para más detalles.</div>;
  if (!categoriaId) return <div className="dropdown-placeholder">Seleccione una categoría primero</div>;

  return (
    <div>
      <label htmlFor="servicio">Selecciona un servicio</label>
      <select
        id="servicio"
        value={value}
        onChange={handleServicioChange}
        disabled={servicios.length === 0}
      >
        <option value="">Seleccione un servicio</option>
        {servicios.map((servicio) => (
          <option 
            // Aseguramos que la key sea única y esté siempre definida
            key={servicio.id_servicio || `servicio-${servicio.nombre}`} 
            value={servicio.id_servicio || servicio.id}
          >
            {servicio.nombre}
          </option>
        ))}
      </select>
      {servicios.length === 0 && !loading && <div className="no-servicios">No hay servicios disponibles para esta categoría</div>}
    </div>
  );
};

export default DropdownServicios;