import React, { useEffect, useState, useCallback } from 'react';

const DropdownClientes = ({ onChange, value, onClientesLoaded }) => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Memoizamos la función notificadora para evitar regeneraciones
  const notifyClientesLoaded = useCallback((data) => {
    if (onClientesLoaded && typeof onClientesLoaded === 'function') {
      onClientesLoaded(data);
    }
  }, [onClientesLoaded]);

  // Obtener todos los clientes al montar el componente
  useEffect(() => {
    const fetchClientes = async () => {
      setLoading(true);
      try {
        console.log('Intentando cargar clientes');
        const response = await fetch('https://spabackend-production-e093.up.railway.app/clientesAdm');
        
        if (!response.ok) {
          // Mostrar detalles del error para ayudar en el diagnóstico
          const errorText = await response.text();
          console.error(`Error HTTP ${response.status}: ${errorText}`);
          throw new Error(`Error al cargar los clientes (${response.status})`);
        }
        
        const data = await response.json();
        console.log('Clientes cargados:', data);
        setClientes(data);
        
        // Notificar que los clientes se cargaron
        notifyClientesLoaded(data);
      } catch (err) {
        console.error('Error al cargar clientes:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClientes();
  }, [notifyClientesLoaded]); // Solo se ejecuta al montar el componente o cuando cambia la función notificadora

  // Función para manejar el cambio de cliente
  const handleClienteChange = (e) => {
    const clienteId = e.target.value;
    
    // Intentamos convertir el ID a número solo si no está vacío
    const numericId = clienteId ? parseInt(clienteId, 10) : "";
    
    // Verificamos que sea un número válido
    if (clienteId && isNaN(numericId)) {
      console.error("ID de cliente inválido:", clienteId);
      return;
    }
    
    // Encontrar el cliente seleccionado para obtener su nombre completo
    const clienteSeleccionado = clientes.find(c => c.id_cliente == clienteId);
    const nombreCompleto = clienteSeleccionado 
      ? `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}`
      : '';
    
    console.log("Selección de cliente - ID:", numericId, "Nombre:", nombreCompleto);
    
    // Pasar tanto el ID como el nombre completo al componente padre
    onChange(numericId, nombreCompleto);
  };

  if (loading) return <div className="form-group"><div>Cargando clientes...</div></div>;
  if (error) return <div className="form-group error">Error: {error} - Por favor revisa la consola para más detalles.</div>;

  return (
    <div className="form-group">
      <label htmlFor="cliente">Cliente:</label>
      <select
        id="cliente"
        value={value || ""}
        onChange={handleClienteChange}
        disabled={loading || clientes.length === 0}
        required
      >
        <option value="">Seleccione un cliente</option>
        {clientes.map((cliente) => (
          <option 
            key={cliente.id_cliente || `cliente-${cliente.nombre}-${cliente.apellido}`} 
            value={cliente.id_cliente}
          >
            {cliente.nombre} {cliente.apellido} - {cliente.telefono}
          </option>
        ))}
      </select>
      {clientes.length === 0 && !loading && 
        <div className="no-clientes">No hay clientes disponibles</div>
      }
    </div>
  );
};

export default DropdownClientes;