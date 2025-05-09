import React from "react";

/**
 * Componente reutilizable para tablas con scroll
 * @param {Object} props
 * @param {Array} props.headers - Array de strings con los nombres de las columnas
 * @param {Array} props.data - Array de objetos con los datos a mostrar
 * @param {Array} props.columns - Array de strings con las propiedades de los objetos a mostrar
 * @param {Function} props.onRowClick - Función que se ejecuta al hacer click en una fila
 * @param {Object} props.selectedRow - Objeto seleccionado actualmente
 * @param {Function} props.getRowClassName - Función que devuelve una clase CSS adicional para una fila
 * @param {Object} props.customRenderers - Objeto con funciones para renderizar celdas personalizadas
 * @param {Number} props.maxHeight - Altura máxima de la tabla en píxeles (default: 400px)
 * @param {String} props.emptyMessage - Mensaje a mostrar cuando no hay datos
 */
const TablaScroll = ({
  headers,
  data,
  columns,
  onRowClick,
  selectedRow,
  getRowClassName,
  customRenderers = {},
  maxHeight = 400,
  emptyMessage = "No hay datos disponibles"
}) => {
  return (
    <div className="scrollable-table-container" style={{ maxHeight: `${maxHeight}px`, overflowY: "auto" }}>
      <table className="tabla">
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={headers.length} style={{ textAlign: "center" }}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, rowIndex) => {
              // Determinar si esta fila está seleccionada
              const isSelected = selectedRow && item.id === selectedRow.id;
              
              // Construir la clase para la fila
              let rowClass = isSelected ? "selected-row" : "";
              if (getRowClassName) {
                const additionalClass = getRowClassName(item);
                if (additionalClass) {
                  rowClass += ` ${additionalClass}`;
                }
              }

              return (
                <tr
                  key={item.id || rowIndex}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={rowClass}
                >
                  {columns.map((column, colIndex) => {
                    // Verificar si existe un renderizador personalizado para esta columna
                    if (customRenderers[column]) {
                      return (
                        <td key={colIndex}>
                          {customRenderers[column](item[column], item)}
                        </td>
                      );
                    }
                    // Renderizado por defecto
                    return <td key={colIndex}>{item[column]}</td>;
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      
      <style jsx>{`
        .scrollable-table-container {
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        
        .tabla {
          width: 100%;
          border-collapse: collapse;
        }
        
        .tabla th {
          background-color: #f5f5f5;
          padding: 12px 15px;
          text-align: left;
          font-weight: bold;
          position: sticky;
          top: 0;
          z-index: 10;
          box-shadow: 0 2px 2px -1px rgba(0, 0, 0, 0.1);
        }
        
        .tabla td {
          padding: 10px 15px;
          border-top: 1px solid #f0f0f0;
        }
        
        .tabla tr:hover {
          background-color: #f9f9f9;
        }
        
        .selected-row {
          background-color: #f0f0f0 !important;
        }
        
        .tabla tr {
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default TablaScroll;