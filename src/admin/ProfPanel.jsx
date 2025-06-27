import React, { useState } from "react";
import "./ProfPanel.css";
import ProfTurnosSection from "./ProfTurnosSection.jsx";
import ProfClientesSection from "./ProfClientesSection.jsx";
import ProfPagosSection from "./ProfPagosSection.jsx";

const ProfPanel = () => {
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
              TURNOS
            </a>
          </li>
          <li className={activeSection === "clientes" ? "active" : ""}>
            <a href="#clientes" onClick={() => scrollToSection("clientes")}>
              CLIENTES
            </a>
          </li>
          <li className={activeSection === "pagos" ? "active" : ""}>
            <a href="#pagos" onClick={() => scrollToSection("pagos")}>
              PAGOS
            </a>
          </li>
        </ul>
      </header>

      <div className="admin-content">
        <div className="admin-header-simple">
          <h1>Perfil de Profesionala</h1>
          <p>Gestión de turnos, clientes y pagos</p>
        </div>

        <ProfTurnosSection />
        <ProfClientesSection />
        <ProfPagosSection />
      </div>
    </div>
  );
};

export default ProfPanel;