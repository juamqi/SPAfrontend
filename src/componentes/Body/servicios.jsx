import React, { useState, useEffect } from 'react';
import Card from '../cards';
import Modal from '../modal.jsx';
import '../../styles/servicios.css';
import '../../styles/modal.css';
import masagesImg from '../../assets/masajes.jpg';
import bellezaImg from '../../assets/belleza.jpg';
import facialesImg from '../../assets/faciales.jpg';
import saunaImg from '../../assets/sauna.jpg';
import hidromasajesImg from '../../assets/hidromasajes.jpg';
import yogaImg from '../../assets/yoga.jpg';

const Servicios = () => {
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [serviciosPorCategoria, setServiciosPorCategoria] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getDefaultImage = (categoryName) => {
    const name = categoryName.toLowerCase();
    console.log("Asignando imagen a:", name);
    if (name.includes('hidro')) return hidromasajesImg;
    if (name.includes('yoga')) return yogaImg;
    if (name.includes('masaje')) return masagesImg;
    if (name.includes('belleza')) return bellezaImg;
    if (name.includes('facial')) return facialesImg;
    if (name.includes('corporal')) return saunaImg;
    return masagesImg;
  };

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await fetch('http://spabackend-production.up.railway.app/api/servicios/categorias');
        if (!response.ok) throw new Error('Error al obtener categorías');
        const data = await response.json();
        setCategorias(data);

        const serviciosData = {};
        await Promise.all(data.map(async (categoria) => {
          const servResponse = await fetch(`http://spabackend-production.up.railway.app/api/servicios/por-categoria/${categoria.id_categoria}`);
          if (!servResponse.ok) throw new Error(`Error al obtener servicios para ${categoria.nombre}`);
          const servicios = await servResponse.json();
          serviciosData[categoria.id_categoria] = servicios;
        }));

        setServiciosPorCategoria(serviciosData);
        setLoading(false);
      } catch (err) {
        console.error("Error cargando datos:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCategorias();
  }, []);

  const handleCardClick = (servicio) => {
    if (servicio.options) {
      setServicioSeleccionado({
        ...servicio,
        esCategoria: true
      });
    } else {
      setServicioSeleccionado(servicio);
    }
  };

  const cerrarModal = () => {
    setServicioSeleccionado(null);
  };

  if (loading) return <div className="loading-container"><div className="loading-spinner"></div></div>;
  if (error) return <div className="error-container">Error: {error}</div>;

  const serviciosIndividuales = [];
  const serviciosGrupales = [];

  categorias.forEach(categoria => {
    const servicios = serviciosPorCategoria[categoria.id_categoria] || [];
    const tieneServiciosGrupales = servicios.some(s => s.tipo?.trim().toLowerCase() === 'grupal');
    const tieneServiciosIndividuales = servicios.some(s => s.tipo?.trim().toLowerCase() === 'individual');

    if (tieneServiciosIndividuales) {
      const serviciosIndividualesData = servicios.filter(s => s.tipo === 'Individual').map(s => ({
        id_servicio: s.id_servicio,
        nombre: s.nombre,
        descripcion: s.descripcion,
        precio: s.precio
      }));

      serviciosIndividuales.push({
        id: categoria.id_categoria,
        id_categoria: categoria.id_categoria,
        title: categoria.nombre,
        imageSrc: getDefaultImage(categoria.nombre),
        options: serviciosIndividualesData
      });
    }

    if (tieneServiciosGrupales) {
      servicios.filter(s => s.tipo === 'Grupal').forEach(s => {
        serviciosGrupales.push({
          id: s.id_servicio,
          id_servicio: s.id_servicio,
          title: s.nombre,
          imageSrc: getDefaultImage(categoria.nombre),
          descripcion: s.descripcion,
          precio: s.precio
        });
      });
    }
  });

  return (
    <section className="servicios-section" id="servicios">
      <div className="servicios-overlay"></div>
      <div className="servicios-container">
        <h2 className="section-title">Servicios</h2>
        <p className="servicios-description">
          Descubre nuestra amplia variedad de tratamientos diseñados para renovar tu cuerpo y calmar tu mente. Para más detalles, seleccioná una categoría.
        </p>

        <div className="servicios-columns-wrapper">
          <div className="servicios-column">
            <h3 className="servicios-category-title">Servicios Individuales</h3>
            <div className="servicios-cards-grid">
              {serviciosIndividuales.map((servicio) => (
                <div
                  key={servicio.id}
                  className="servicio-card-wrapper"
                  onClick={() => handleCardClick(servicio)}
                >
                  <Card
                    title={servicio.title}
                    imageSrc={servicio.imageSrc}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="servicios-column">
            <h3 className="servicios-category-title">Servicios Grupales</h3>
            <div className="servicios-cards-grid servicios-grid-grupales">
              {serviciosGrupales.map((servicio) => (
                <div
                  key={servicio.id}
                  className="servicio-card-wrapper"
                  onClick={() => handleCardClick(servicio)}
                >
                  <Card
                    title={servicio.title}
                    imageSrc={servicio.imageSrc}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Modal servicio={servicioSeleccionado} onClose={cerrarModal} />
    </section>
  );
};

export default Servicios;