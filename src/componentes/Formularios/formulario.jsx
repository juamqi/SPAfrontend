import React, { useState } from 'react';
import { useEffect } from 'react';
import Input from './input';
import Boton from './boton.jsx';
import '../../styles/formularioRegistro.css';
import { X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { usePopupContext } from '../../componentes/popupcontext.jsx';

const Formulario = ({ onClose }) => {
  const { login } = useAuth();
  const { showPopup } = usePopupContext();
  const [formMode, setFormMode] = useState('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    nombre: '',
    apellido: '',
    direccion: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));

    if (passwordError && (name === 'newPassword' || name === 'confirmNewPassword' || name === 'password' || name === 'confirmPassword')) {
      setPasswordError('');
    }

    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (formMode === 'login') {
        if (!formData.email || !formData.password) {
          setError('Por favor complete todos los campos');
          setLoading(false);
          return;
        }

        try {
          console.log('Intentando login con:', { email: formData.email });

          const response = await fetch('https://spabackend-production-e093.up.railway.app/api/clientes/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: formData.email,
              password: formData.password
            })
          });

          console.log('Status de respuesta:', response.status);

          const data = await response.json();
          console.log('Datos recibidos del servidor:', data);

          if (!response.ok) {
            setError(data.error || 'Error al iniciar sesión');
            setLoading(false);
            return;
          }

          if (!data.cliente || !data.cliente.id_cliente) {
            console.error('Error: La respuesta del servidor no contiene los datos esperados', data);
            setError('Error de formato en la respuesta. Contacte al administrador.');
            setLoading(false);
            return;
          }

          login(data.cliente);

          console.log('Cliente logueado:', data.cliente);
          showPopup({
            type: 'success',
            title: 'Iniciaste sesión',
            message: `¡Bienvenido, ${data.cliente.nombre}!`,
          });

          onClose();
        } catch (err) {
          console.error('Error completo durante el login:', err);
          setError('Error de conexión con el servidor. Verifique su conexión a internet o contacte al administrador.');
          setLoading(false);
        }
      }
      else if (formMode === 'register') {
        if (!formData.nombre || !formData.apellido || !formData.email || !formData.phone || !formData.direccion || !formData.password) {
          setError('Por favor complete todos los campos');
          setLoading(false);
          return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          setError('Por favor ingrese un email válido');
          setLoading(false);
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          setPasswordError('Las contraseñas no coinciden');
          setLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          setPasswordError('La contraseña debe tener al menos 6 caracteres');
          setLoading(false);
          return;
        }

        const response = await fetch('https://spabackend-production-e093.up.railway.app/api/clientes/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            nombre: formData.nombre,
            apellido: formData.apellido,
            email: formData.email,
            telefono: formData.phone,
            direccion: formData.direccion,
            password: formData.password
          })
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Error al registrar usuario');
          setLoading(false);
          return;
        }
        showPopup({
          type: 'success',
          title: 'Registro exitoso',
          message: '¡Registro exitoso! Ahora puede iniciar sesión.',
           
        });
        setFormMode('login');
        resetForm();
      }
      else if (formMode === 'recovery') {
        if (!formData.email) {
          setError('Por favor ingrese su correo electrónico');
          setLoading(false);
          return;
        }

        showPopup({
          type: 'info',
          title: 'Recuperación de contraseña',
          message: `Se ha enviado un correo para la recuperación de clave a: ${formData.email}`,
           
        });
        setFormMode('login');
        resetForm();
      }
      else if (formMode === 'changePassword') {
        if (!formData.email || !formData.currentPassword || !formData.newPassword || !formData.confirmNewPassword) {
          setError('Por favor complete todos los campos');
          setLoading(false);
          return;
        }

        if (formData.newPassword !== formData.confirmNewPassword) {
          setPasswordError('Las nuevas contraseñas no coinciden');
          setLoading(false);
          return;
        }

        try {
          const response = await fetch('https://spabackend-production-e093.up.railway.app/api/clientes/cambiar-password', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: formData.email,
              passwordActual: formData.currentPassword,
              passwordNueva: formData.newPassword,
              confirmacionPasswordNueva: formData.confirmNewPassword
            })
          });

          const data = await response.json();

          if (!response.ok) {
            setError(data.error || 'Error al cambiar la contraseña');
            return;
          }

          showPopup({
            type: 'success',
            title: 'Cambio de contraseña',
            message: '¡Cambio de contraseña exitoso!',
             
          });
          setFormMode('login');
          resetForm();
        } catch (err) {
          console.error('Error al cambiar la contraseña:', err);
          setError('Error de conexión con el servidor');
        }
      }
    } catch (err) {
      console.error('Error en la operación:', err);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      nombre: '',
      apellido: '',
      direccion: '',
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    });
    setPasswordError('');
    setError('');
  };

  const toggleForm = () => {
    setFormMode(formMode === 'login' ? 'register' : 'login');
    resetForm();
  };

  const goToPasswordRecovery = () => {
    setFormMode('recovery');
    setFormData(prevState => ({
      ...prevState,
      password: '',
      confirmPassword: '',
      phone: '',
      nombre: '',
      apellido: '',
      direccion: '',
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    }));
    setError('');
  };

  const goToChangePassword = () => {
    setFormMode('changePassword');
    setFormData(prevState => ({
      ...prevState,
      password: '',
      confirmPassword: '',
      phone: '',
      nombre: '',
      apellido: '',
      direccion: '',
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    }));
    setError('');
  };

  const goBackToLogin = () => {
    setFormMode('login');
    resetForm();
  };

  const getFormTitle = () => {
    switch (formMode) {
      case 'login': return 'Iniciar sesión';
      case 'register': return 'Registrarse';
      case 'recovery': return 'Recuperación';
      case 'changePassword': return 'Cambio de clave';
      default: return 'Iniciar sesión';
    }
  };

  return (
    <div className="auth-sidebar">
      <div className="auth-sidebar-header">
        <button className="close-button" onClick={onClose}>
          <X size={24} />
        </button>
        <h1>{getFormTitle()}</h1>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email">Correo electrónico</label>
          <Input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Ingrese su correo electrónico"
            required
          />
        </div>

        {formMode === 'login' && (
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <Input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Ingrese su contraseña"
              required
            />
          </div>
        )}

        {formMode === 'login' && (
          <div className="forgot-password-container">
            <span
              className="forgot-password-link"
              onClick={goToChangePassword}
            >
              Cambiar clave
            </span>
            <span
              className="forgot-password-link"
              onClick={goToPasswordRecovery}
            >
              Olvidé mi clave
            </span>
          </div>
        )}

        {formMode === 'register' && (
          <>
            <div className="form-group">
              <label htmlFor="nombre">Nombre</label>
              <Input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ingrese su nombre"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="apellido">Apellido</label>
              <Input
                type="text"
                id="apellido"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                placeholder="Ingrese su apellido"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="direccion">Dirección</label>
              <Input
                type="text"
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                placeholder="Ingrese su dirección"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Teléfono</label>
              <Input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Ingrese su número de teléfono"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <Input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Ingrese su contraseña"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Repetir Clave</label>
              <Input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirme su contraseña"
                required
              />
            </div>
            {passwordError && (
              <div className="error-message">
                {passwordError}
              </div>
            )}
          </>
        )}

        {formMode === 'changePassword' && (
          <>
            <div className="form-group">
              <label htmlFor="currentPassword">Contraseña actual</label>
              <Input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Ingrese su contraseña actual"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="newPassword">Nueva contraseña</label>
              <Input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Ingrese su nueva contraseña"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmNewPassword">Confirmar nueva contraseña</label>
              <Input
                type="password"
                id="confirmNewPassword"
                name="confirmNewPassword"
                value={formData.confirmNewPassword}
                onChange={handleChange}
                placeholder="Confirme su nueva contraseña"
                required
              />
            </div>
            {passwordError && (
              <div className="error-message">
                {passwordError}
              </div>
            )}
          </>
        )}

        {formMode === 'recovery' && (
          <div className="recovery-message">
            Ingrese su correo electrónico y le enviaremos instrucciones para recuperar su contraseña.
          </div>
        )}

        <div className="auth-buttons">
          {formMode === 'recovery' ? (
            <>
              <Boton
                type="submit"
                text="Enviar correo de recuperación"
                fullWidth
                disabled={loading}
              />
              <Boton
                type="button"
                text="Volver a inicio de sesión"
                backgroundColor="#1E6091"
                hoverBackgroundColor="#154B73"
                onClick={goBackToLogin}
                fullWidth
                disabled={loading}
              />
            </>
          ) : formMode === 'changePassword' ? (
            <>
              <Boton
                type="submit"
                text="Cambiar contraseña"
                fullWidth
                disabled={loading}
              />
              <Boton
                type="button"
                text="Volver a inicio de sesión"
                backgroundColor="#1E6091"
                hoverBackgroundColor="#154B73"
                onClick={goBackToLogin}
                fullWidth
                disabled={loading}
              />
            </>
          ) : (
            <>
              <Boton
                type="submit"
                text={formMode === 'login' ? "Iniciar sesión" : "Confirmar registro"}
                fullWidth
                style={{ marginBottom: '10px' }}
                disabled={loading}
              />
              <Boton
                type="button"
                text={formMode === 'login' ? "Registrarse" : "Volver a inicio de sesión"}
                backgroundColor="#1E6091"
                hoverBackgroundColor="#154B73"
                onClick={toggleForm}
                fullWidth
                style={{ marginBottom: '10px' }}
                disabled={loading}
              />
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default Formulario;