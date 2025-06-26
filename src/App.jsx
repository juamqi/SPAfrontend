import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/fonts.css';
import './App.css';
import AdminPrivateRoute from './admin/AdminPrivateRoute.jsx';
import ProfPrivateRoute from './admin/ProfPrivateRoute.jsx';
import UnifiedLogin from './admin/AdminLogin';
import Layout from './Layout.jsx';
import Hero from './componentes/Body/hero.jsx';
import Servicios from './componentes/Body/servicios.jsx';
import SobreNosotros from './componentes/Body/sobre-nosotros.jsx';
import Contacto from './componentes/Body/contacto.jsx';
import Header from './componentes/Header/header.jsx';
import Galeria from './componentes/Body/galeria.jsx';
import PerfilUsuario from './componentes/PerfilUsuario/PerfilUsuario.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import Chatbot from './componentes/chatbot.jsx';
import { AdminAuthProvider } from './context/AdminAuthContext.jsx';
import { ProfAuthProvider } from './context/ProfAuthContext.jsx';
import { PopupProvider } from './componentes/popupcontext.jsx'; 

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
      <AdminAuthProvider>
        <ProfAuthProvider>
          <PopupProvider> 
            <Router>
              <Chatbot />
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/perfil" element={<PerfilUsuario />} />
                </Route>
                <Route path="/admin-login" element={<UnifiedLogin />} />
                <Route path="/prof-login" element={<UnifiedLogin />} />
                <Route path="/dashboard" element={<AdminPrivateRoute />} />
                <Route path="/prof-panel" element={<ProfPrivateRoute />} />
              </Routes>
            </Router>
          </PopupProvider>
        </ProfAuthProvider>
      </AdminAuthProvider>
    </AuthProvider>
  );
}

export default App;