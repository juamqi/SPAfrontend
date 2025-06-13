import { useAdminAuth } from '../context/AdminAuthContext';
import { Navigate } from 'react-router-dom';
import AppAdmin from './AppAdmin'; 

const AdminPrivateRoute = () => {
  const { isAuthenticated, loading } = useAdminAuth(); // ✅ Solo destructuro lo que uso

  if (loading) return <p>Cargando...</p>;

  // Verificar si está autenticado como admin
  if (!isAuthenticated()) {
    return <Navigate to="/admin-login" />;
  }

  return <AppAdmin />;
};

export default AdminPrivateRoute;