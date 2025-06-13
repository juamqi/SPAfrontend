import { useProfAuth } from '../context/ProfAuthContext';
import { Navigate } from 'react-router-dom';
import ProfPanel from './ProfPanel'; 

const ProfPrivateRoute = () => {
  const { isAuthenticated, loading } = useProfAuth();

  if (loading) return <p>Cargando...</p>;

  // Verificar si está autenticado como profesional
  if (!isAuthenticated()) {
    return <Navigate to="/prof-login" />;
  }

  return <ProfPanel />;
};

export default ProfPrivateRoute;