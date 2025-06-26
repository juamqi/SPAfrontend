import React, { useEffect, useState, useCallback, useRef } from 'react';

const DropdownServicios = ({ onChange, value, categoriaId, onServiciosLoaded }) => {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Ref para rastrear la categoría anterior
  const prevCategoriaId = useRef(categoriaId);

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
        const response = await fetch(`https://spabackend-production-e093.up.railway.app/api/serviciosAdm/servicios/categoria/${categoriaId}`);
        
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
  }, [categoriaId, notifyServiciosLoaded]);

  // Cuando cambia la categoría, resetear el valor del servicio seleccionado
  useEffect(() => {
    // Solo resetear si la categoría realmente cambió (no en el primer render)
    if (prevCategoriaId.current !== null && prevCategoriaId.current !== categoriaId) {
      if (onChange && value) {
        console.log('Reseteando servicio por cambio de categoría');
        onChange('', '');
      }
    }
    
    // Actualizar la referencia a la categoría actual
    prevCategoriaId.current = categoriaId;
  }, [categoriaId, onChange]);

  // Función para manejar el cambio de servicio
  const handleServicioChange = (e) => {
    const servicioId = e.target.value;
    // Encontrar el nombre del servicio seleccionado - asegurar comparación correcta de tipos
    const servicioSeleccionado = servicios.find(s => 
      String(s.id_servicio) === String(servicioId) || String(s.id) === String(servicioId)
    );
    const nombreServicio = servicioSeleccionado ? servicioSeleccionado.nombre : '';
    
    console.log('Servicio seleccionado:', { servicioId, nombreServicio, servicioSeleccionado });
    console.log('Servicios disponibles:', servicios.map(s => ({ id: s.id_servicio || s.id, nombre: s.nombre })));
    
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
        value={value ? String(value) : ''} // Convertir a string para evitar problemas de tipo
        onChange={handleServicioChange}
        disabled={servicios.length === 0}
      >
        <option value="">Seleccione un servicio</option>
        {servicios.map((servicio) => (
          <option 
            key={servicio.id_servicio || `servicio-${servicio.nombre}`} 
            value={String(servicio.id_servicio || servicio.id)} // Asegurar que sea string
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