import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Logo from './logo';
import Navigation from './navBar';
import LoginButton from './loginButton';
import '../../styles/header.css';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  
  // Determine if we're on the home page
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  // If we arrived at home page with a hash in the URL, scroll to that section
  useEffect(() => {
    if (isHomePage && location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location, isHomePage]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className={`main-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <Logo />
        <div className={`right-content ${menuOpen ? 'open' : ''}`}>
          <Navigation />
          <LoginButton />
        </div>
      </div>
    </header>
  );
};

export default Header;