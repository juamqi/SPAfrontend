import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <Link to="/" className="logo">
      <div className="logo-text">
        <h1 className="logo-main">SPA</h1>
        <p className="logo-subtitle">Sentirse Bien</p>
      </div>
    </Link>
  );
};

export default Logo;