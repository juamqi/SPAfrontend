import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import '../styles/AdminLogin.css'; 

const AdminLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('https://spabackend-production.up.railway.app/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        login(data.administrador); 
        navigate('/dashboard');
      } else {
        alert(data.error || 'Error al iniciar sesión');
      }
    } catch (error) {
      console.error('Error al loguear admin:', error);
      alert('Error al conectar con el servidor');
    }
  };

  return (
    <div className="admin-login-section">
      <div className="admin-login-overlay"></div>
      <div className="admin-login-container">
        <div className="admin-login-content">
          <div className="admin-login-header">
            <div className="admin-login-icon">
              <i className="fas fa-lock"></i>
            </div>
            <h2 className="admin-login-title">Acceso de Administrador</h2>
            <p className="admin-login-subtitle">Ingrese sus credenciales para continuar</p>
          </div>
          
          <form onSubmit={handleSubmit} className="admin-login-form">
            <div className="admin-form-group">
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="admin-form-input"
                style={{"--input-order": 1}}
                required
              />
            </div>
            
            <div className="admin-form-group">
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="admin-form-input"
                style={{"--input-order": 2}}
                required
              />
            </div>
            
            <div className="admin-form-submit">
              <button type="submit" className="admin-login-button">Iniciar Sesión</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;