import React, { useEffect, useState } from 'react';

// Este es un componente de dropbox reutilizable
const DropdownCategorias = ({ onChange, value }) => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obtener las categorías desde la API
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/categoriasAdm');
        if (!response.ok) {
          throw new Error('Error al cargar las categorías');
        }
        const data = await response.json();
        setCategorias(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCategorias();
  }, []);

  if (loading) return <div>Cargando categorías...</div>;
  if (error) return <div>Error: {error}</div>;

  // Renderizar las opciones del dropdown
  return (
    <div>
      <label htmlFor="categoria">Selecciona una categoría</label>
      <select
        id="categoria"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Seleccione una categoría</option>
        {categorias.map((categoria) => (
          <option key={categoria.id_categoria} value={categoria.id_categoria}>
            {categoria.nombre}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DropdownCategorias;
