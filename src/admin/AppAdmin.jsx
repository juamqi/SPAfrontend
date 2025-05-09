import React, { useState } from "react";
import "./AppAdmin.css";
import TurnosSection from "./TurnosSection.jsx";
import ServiciosSection from "./ServiciosSection.jsx";
import ProfesionalesSection from "./ProfesionalesSection.jsx"; 
import ClientesSection from "./ClientesSection.jsx";

const AppAdmin = () => {
  const [activeSection, setActiveSection] = useState("turnos");

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div>
      <header className="admin-navbar">
        <div className="navbar-brand">SPA "Sentirse Bien"</div>
        <div className="navbar-spacer"></div>
        <ul>
          <li className={activeSection === "turnos" ? "active" : ""}>
            <a href="#turnos" onClick={() => scrollToSection("turnos")}>
              Turnos
            </a>
          </li>
          <li className={activeSection === "servicios" ? "active" : ""}>
            <a href="#servicios" onClick={() => scrollToSection("servicios")}>
              Servicios
            </a>
          </li>
          <li className={activeSection === "profesionales" ? "active" : ""}>
            <a href="#profesionales" onClick={() => scrollToSection("profesionales")}>
              Profesionales
            </a>
          </li>
          <li className={activeSection === "clientes" ? "active" : ""}>
            <a href="#clientes" onClick={() => scrollToSection("clientes")}>
              Clientes
            </a>
          </li>
        </ul>
      </header>

      <div className="admin-content">
        <div className="admin-header-simple">
          <h1>Panel de Administración</h1>
          <p>Gestión de turnos, servicios y profesionales</p>
        </div>

        <TurnosSection />
        <ServiciosSection />
        <ProfesionalesSection />
        <ClientesSection />
      </div>
    </div>
  );
};

export default AppAdmin;