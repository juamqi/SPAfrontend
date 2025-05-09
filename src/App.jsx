import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/fonts.css';
import './App.css';
import AdminPrivateRoute from './admin/AdminPrivateRoute';
import AdminLogin from './admin/AdminLogin';
import Layout from './Layout.jsx';
import Hero from './componentes/Body/hero.jsx';
import Servicios from './componentes/Body/servicios.jsx';
import SobreNosotros from './componentes/Body/sobre-nosotros.jsx';
import Contacto from './componentes/Body/contacto.jsx';
import Header from './componentes/Header/header.jsx';
import Galeria from './componentes/Body/galeria.jsx';
import PerfilUsuario from './componentes/PerfilUsuario/PerfilUsuario.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

const Home = () => {
  return (
    <div className="main-content">
      <section className="section hero-section" id="hero">
        <Hero />
      </section>
      <section className="section section-masajes" id="sobre-nosotros">
        <SobreNosotros />
      </section>
      <section className="section section-servicios" id="servicios">
        <Servicios />
      </section>
      <section className="section" id="fotos">
        <Galeria />
      </section>
      <section className="section section-contacto" id="contacto">
        <Contacto />
      </section>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/perfil" element={<PerfilUsuario />} />
          </Route>

          {/* Rutas sin Header */}
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/dashboard" element={<AdminPrivateRoute />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

