import './ClienteFilterComponent.css';
import React, { useState, useEffect, useRef } from 'react';


/**
 * Componente para filtrar clientes por nombre y apellido
 *
 * @param {Object} props
 * @param {Function} props.onFilterChange - Función callback que se ejecuta cuando cambian los filtros
 * @param {string} props.title - Título del filtro (opcional)
 */
const ClienteFilterComponent = ({
  onFilterChange,
  title = "Filtrar clientes"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const filterRef = useRef(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Avisar al padre del cambio de filtros
  useEffect(() => {
    if (typeof onFilterChange === 'function') {
      onFilterChange({ nombre, apellido });
    }
  }, [nombre, apellido]);

  const handleClearFilters = () => {
    setNombre('');
    setApellido('');
    onFilterChange({ nombre: '', apellido: '' });
  };

  const toggleDropdown = () => setIsOpen(!isOpen);

  const hasActiveFilters = nombre || apellido;

  return (
    <div className="cliente-filter-component" ref={filterRef}>
      <div className="filter-header" onClick={toggleDropdown}>
        <span className="filter-title">{title}</span>
        <span className="filter-icon">{isOpen ? '▲' : '▼'}</span>
      </div>

      {isOpen && (
        <div className="filter-dropdown">
          <div className="search-container">
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Buscar por nombre"
              className="search-input"
            />
            <input
              type="text"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              placeholder="Buscar por apellido"
              className="search-input"
            />
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
                <>
                  Filtros activos:&nbsp;
                  {nombre && `Nombre: "${nombre}" `} 
                  {apellido && `Apellido: "${apellido}"`}
                </>
              ) : (
                "Sin filtros activos"
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClienteFilterComponent;
