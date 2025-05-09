import React from 'react';
import NavItem from './navItem';

const Navigation = () => {
  const menuItems = [
    { text: 'Inicio', href: '#inicio' },
    { text: 'Sobre Nosotros', href: '#sobre-nosotros' },
    { text: 'Servicios', href: '#servicios' },
    { text: 'Galería', href: '#fotos' },
    { text: 'Contacto', href: '#contacto' },
  ];

  return (
    <nav className="navigation">
      <ul>
        {menuItems.map((item, index) => (
          <NavItem 
            key={index} 
            text={item.text} 
            href={item.href} 
          />
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;