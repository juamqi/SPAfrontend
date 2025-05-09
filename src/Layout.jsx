import { Outlet, useLocation } from 'react-router-dom';
import Header from './componentes/Header/header';

const Layout = () => {
  const location = useLocation();
  const hideHeaderRoutes = ['/admin-login', '/dashboard']; // rutas sin Header

  const showHeader = !hideHeaderRoutes.includes(location.pathname);

  return (
    <>
      {showHeader && <Header />}
      <Outlet />
    </>
  );
};

export default Layout;