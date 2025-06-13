import React, { useState, useEffect, useRef } from 'react';
import './FilterComponent.css';

/**
 * Componente reutilizable para filtrar datos por término de búsqueda, estado y servicios
 * 
 * @param {Object} props
 * @param {Array} props.data - Array de datos a filtrar 
 * @param {Function} props.onFilterChange - Función callback que devuelve los datos filtrados
 * @param {string} props.searchField - Campo por el que se filtrará (ej: "cliente", "profesional")
 * @param {string} props.placeholder - Texto de placeholder para el input
 * @param {string} props.title - Título del filtro (opcional)
 * @param {boolean} props.showStatusFilter - Mostrar filtro de estado (opcional)
 * @param {Array} props.availableStatuses - Lista de estados disponibles (opcional)
 * @param {boolean} props.showServiceFilter - Mostrar filtro de servicios (opcional)
 * @param {string} props.apiUrl - URL del endpoint de servicios (opcional, por defecto usa '/api/admin/servicios')
 */
const FilterComponent = ({ 
  data = [], 
  onFilterChange, 
  searchField = "cliente",
  placeholder = "Buscar...",
  title = "Filtrar por",
  showStatusFilter = false,
  availableStatuses = ['Solicitado', 'Cancelado', 'Realizado'],
  showServiceFilter = false,
  apiUrl = '/api/admin/servicios'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [servicios, setServicios] = useState([]);
  const [loadingServicios, setLoadingServicios] = useState(false);
  const [errorServicios, setErrorServicios] = useState('');
  const filterRef = useRef(null);

  // Cargar servicios desde el backend
  useEffect(() => {
    if (showServiceFilter) {
      fetchServicios();
    }
  }, [showServiceFilter, apiUrl]);

  const fetchServicios = async () => {
    setLoadingServicios(true);
    setErrorServicios('');
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const serviciosData = await response.json();
      setServicios(serviciosData);
    } catch (error) {
      console.error('Error al cargar servicios:', error);
      setErrorServicios('Error al cargar los servicios');
      setServicios([]);
    } finally {
      setLoadingServicios(false);
    }
  };

  // Filtrar datos cuando cambie cualquier filtro
  useEffect(() => {
    filterData();
  }, [searchTerm, selectedStatus, selectedDate, selectedService, data]);

  // Efecto para manejar clics fuera del componente
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filterData = () => {
    if (!data || data.length === 0) return;
  
    let filteredResults = [...data];
  
    // Filtrar por término de búsqueda
    if (searchTerm.trim()) {
      const searchTermLower = searchTerm.toLowerCase();
      filteredResults = filteredResults.filter(item => {
        if (!item[searchField]) {
          return Object.values(item).some(
            value =>
              typeof value === 'string' &&
              value.toLowerCase().includes(searchTermLower)
          );
        }
        return item[searchField].toLowerCase().includes(searchTermLower);
      });
    }
  
    // Filtrar por estado
    if (selectedStatus) {
      filteredResults = filteredResults.filter(item => item.estado === selectedStatus);
    }
  
    // Filtrar por fecha
    if (selectedDate) {
      filteredResults = filteredResults.filter(item => item.fecha === selectedDate);
    }

    // Filtrar por servicio
if (selectedService) {
  // Buscar el nombre del servicio seleccionado
  const servicioSeleccionado = servicios.find(s => s.id === parseInt(selectedService));
  const nombreServicio = servicioSeleccionado ? servicioSeleccionado.nombre : selectedService;
  
  filteredResults = filteredResults.filter(item => {
    // Comparar con el nombre del servicio (que es lo que tienen los turnos)
    return item.servicio === nombreServicio ||
           item.nombre_servicio === nombreServicio ||
           item.id_servicio === parseInt(selectedService);
  });
}
  
    onFilterChange(filteredResults);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
  };

  const handleServiceChange = (e) => {
    setSelectedService(e.target.value);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setSelectedDate('');
    setSelectedService('');
    onFilterChange(data);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Calcular resultados filtrados para mostrar el contador
  const getFilteredCount = () => {
  if (!data || data.length === 0) return 0;
  
  return data.filter(item => {
    // Filtro por término de búsqueda
    const matchesSearch = !searchTerm.trim() || 
      (item[searchField] && 
       item[searchField].toLowerCase().includes(searchTerm.toLowerCase())) ||
      (!item[searchField] && Object.values(item).some(
        value => typeof value === 'string' && 
        value.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    
    // Filtro por estado
    const matchesStatus = !selectedStatus || item.estado === selectedStatus;
    
    // Filtro por fecha
    const matchesDate = !selectedDate || item.fecha === selectedDate;

    // Filtro por servicio - CORREGIDO
    let matchesService = true;
    if (selectedService) {
      const servicioSeleccionado = servicios.find(s => s.id === parseInt(selectedService));
      const nombreServicio = servicioSeleccionado ? servicioSeleccionado.nombre : selectedService;
      
      matchesService = item.servicio === nombreServicio ||
                      item.nombre_servicio === nombreServicio ||
                      item.id_servicio === parseInt(selectedService);
    }
    
    return matchesSearch && matchesStatus && matchesDate && matchesService;
  }).length;
};

  return (
    <div className="filter-component" ref={filterRef}>
      <div className="filter-header" onClick={toggleDropdown}>
        <span className="filter-title">{title}</span>
        <span className="filter-icon">{isOpen ? '▲' : '▼'}</span>
      </div>
      
      {isOpen && (
        <div className="filter-dropdown">
          <div className="search-container">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder={placeholder}
              className="search-input"
            />
            {searchTerm && (
              <button 
                className="clear-button" 
                onClick={() => setSearchTerm('')}
                aria-label="Limpiar búsqueda"
              >
                ×
              </button>
            )}
          </div>
          
          {showStatusFilter && (
            <div className="status-filter">
              <select 
                value={selectedStatus} 
                onChange={handleStatusChange}
                className="status-select"
              >
                <option value="">Todos los estados</option>
                {availableStatuses.map(status => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          )}

          {showServiceFilter && (
            <div className="service-filter">
              <select 
                value={selectedService} 
                onChange={handleServiceChange}
                className="service-select"
                disabled={loadingServicios}
              >
                <option value="">Todos los servicios</option>
                {loadingServicios ? (
                  <option disabled>Cargando servicios...</option>
                ) : errorServicios ? (
                  <option disabled>{errorServicios}</option>
                ) : (
                  servicios.map(servicio => (
                    <option key={servicio.id} value={servicio.id}>
                      {servicio.nombre} - {servicio.categoria} ${servicio.precio}
                    </option>
                  ))
                )}
              </select>
              {loadingServicios && <div className="loading-spinner">⟳</div>}
              {errorServicios && (
                <button 
                  className="retry-button" 
                  onClick={fetchServicios}
                  title="Reintentar cargar servicios"
                >
                  ↻
                </button>
              )}
            </div>
          )}

          <div className="date-filter">
            <label htmlFor="date-input">Filtrar por fecha:</label>
            <input
              id="date-input"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="date-input"
            />
            {selectedDate && (
              <button 
                className="clear-button" 
                onClick={() => setSelectedDate('')}
                aria-label="Limpiar fecha"
              >
                ×
              </button>
            )}
          </div>
          
          <div className="filter-actions">
            <button 
              className="clear-all-button" 
              onClick={handleClearFilters}
              disabled={!searchTerm && !selectedStatus && !selectedDate && !selectedService}
            >
              Limpiar filtros
            </button>
          </div>
          
          <div className="filter-info">
            <span className="results-count">
              {data.length > 0 ? 
                `Mostrando ${getFilteredCount()} de ${data.length}` : 
                "No hay datos"
              }
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterComponent;