import { useLocation, useNavigate } from 'react-router-dom';

const NavItem = ({ text, href }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';

  const handleClick = (e) => {
    e.preventDefault();
    
    if (isHomePage) {
      // If we're on home page, scroll to the section
      const section = document.getElementById(href.replace('#', ''));
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // If we're on another page, navigate to home and then to section
      navigate(`/${href}`);
    }
  };

  return (
    <li className="nav-item">
      <a href={href} onClick={handleClick}>
        {text}
      </a>
    </li>
  );
};

export default NavItem;