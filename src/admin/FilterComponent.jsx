import React, { useState, useEffect, useRef } from 'react';
import './FilterComponent.css';

/**
 * Componente reutilizable para filtrar datos por término de búsqueda y estado
 * 
 * @param {Object} props
 * @param {Array} props.data - Array de datos a filtrar 
 * @param {Function} props.onFilterChange - Función callback que devuelve los datos filtrados
 * @param {string} props.searchField - Campo por el que se filtrará (ej: "cliente", "profesional")
 * @param {string} props.placeholder - Texto de placeholder para el input
 * @param {string} props.title - Título del filtro (opcional)
 * @param {boolean} props.showStatusFilter - Mostrar filtro de estado (opcional)
 * @param {Array} props.availableStatuses - Lista de estados disponibles (opcional)
 */
const FilterComponent = ({ 
  data = [], 
  onFilterChange, 
  searchField = "cliente",
  placeholder = "Buscar...",
  title = "Filtrar por",
  showStatusFilter = false,
  availableStatuses = ['Solicitado', 'Cancelado', 'Realizado']
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const filterRef = useRef(null);
  //filtra fecha
  useEffect(() => {
    filterData();
  }, [searchTerm, selectedStatus, selectedDate, data]);

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

  // Efecto para filtrar los datos cuando cambia el término de búsqueda o el estado
  useEffect(() => {
    filterData();
  }, [searchTerm, selectedStatus, data]);

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
  
    onFilterChange(filteredResults);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setSelectedDate('');
    onFilterChange(data);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
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
          
          <div className="filter-actions">
            <button 
              className="clear-all-button" 
              onClick={handleClearFilters}
              disabled={!searchTerm && !selectedStatus && !selectedDate}
              >
              Limpiar filtros
            </button>
          </div>
          
          <div className="filter-info">
            <span className="results-count">
              {data.length > 0 ? 
                `Mostrando ${data.filter(item => {
                  // Filtro por término de búsqueda
                  const matchesSearch = !searchTerm.trim() || 
                    (item[searchField] && 
                     item[searchField].toLowerCase().includes(searchTerm.toLowerCase()));
                  
                  // Filtro por estado
                  const matchesStatus = !selectedStatus || item.estado === selectedStatus;
                  
                  return matchesSearch && matchesStatus;
                }).length} de ${data.length}` : 
                "No hay datos"
              }
            </span>
          </div>
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
        </div>
      )}
    </div>
  );
};

export default FilterComponent;