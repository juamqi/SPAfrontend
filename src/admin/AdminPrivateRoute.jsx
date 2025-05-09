import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import AppAdmin from './AppAdmin'; 

const AdminPrivateRoute = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return <p>Cargando...</p>;

  // En este ejemplo, consideramos admin si el nombre es 'admin'
  const isAdmin = user?.nombre === 'admin';//cambiar nombre

  if (!isAuthenticated() || !isAdmin) {
    return <Navigate to="/admin-login" />;
  }

  return <AppAdmin />;
};

export default AdminPrivateRoute;