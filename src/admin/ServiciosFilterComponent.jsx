import React, { useState, useEffect, useRef } from 'react';
import './ServicioFilterComponent.css';

/**
 * Componente para filtrar servicios por categoría y tipo
 * 
 * @param {Object} props
 * @param {Array} props.categorias - Lista de categorías disponibles
 * @param {Function} props.onFilterChange - Función callback que se ejecuta cuando cambian los filtros
 * @param {string} props.title - Título del componente de filtro
 */
const ServicioFilterComponent = ({
  categorias = [],
  onFilterChange,
  title = "Filtrar servicios"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState('');
  const [selectedTipo, setSelectedTipo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const filterRef = useRef(null);

  // Tipos de servicio disponibles
  const tiposServicio = ['Individual', 'Grupal'];

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

  // Efecto para llamar a la función de filtrado cuando cambia algún filtro
  useEffect(() => {
    handleFilterChange();
  }, [selectedCategoria, selectedTipo, searchTerm]);

  const handleFilterChange = () => {
    // Llamamos a la función de callback con los criterios de filtrado
    onFilterChange({
      categoria: selectedCategoria,
      tipo: selectedTipo,
      searchTerm: searchTerm
    });
  };

  const handleCategoriaChange = (e) => {
    setSelectedCategoria(e.target.value);
  };

  const handleTipoChange = (e) => {
    setSelectedTipo(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClearFilters = () => {
    setSelectedCategoria('');
    setSelectedTipo('');
    setSearchTerm('');
    onFilterChange({
      categoria: '',
      tipo: '',
      searchTerm: ''
    });
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const hasActiveFilters = selectedCategoria || selectedTipo || searchTerm;

  return (
    <div className="servicio-filter-component" ref={filterRef}>
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
              placeholder="Buscar por nombre..."
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
          
          <div className="categoria-filter">
            <select 
              value={selectedCategoria} 
              onChange={handleCategoriaChange}
              className="categoria-select"
            >
              <option value="">Todas las categorías</option>
              {categorias.map(categoria => (
                <option key={categoria.id_categoria} value={categoria.id_categoria}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
          </div>
          
          <div className="tipo-filter">
            <select 
              value={selectedTipo} 
              onChange={handleTipoChange}
              className="tipo-select"
            >
              <option value="">Todos los tipos</option>
              {tiposServicio.map(tipo => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-actions">
            <button 
              className="clear-all-button" 
              onClick={handleClearFilters}
              disabled={!hasActiveFilters}
            >
              Limpiar filtros
            </button>
          </div>
          
          <div className="filter-info">
            <span className="active-filters">
              {hasActiveFilters ? (
                <span>Filtros activos: {[
                  selectedCategoria && `Categoría`,
                  selectedTipo && `Tipo: ${selectedTipo}`,
                  searchTerm && `Búsqueda: "${searchTerm}"`
                ].filter(Boolean).join(', ')}</span>
              ) : (
                <span>Sin filtros activos</span>
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicioFilterComponent;