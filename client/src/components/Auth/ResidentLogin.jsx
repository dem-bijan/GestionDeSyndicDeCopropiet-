import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiUser, FiLock, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import './Auth.css';

const ResidentLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Afficher le message de succès après activation
    if (location.state?.message) {
      setSuccess(location.state.message);
      // Nettoyer le state pour ne pas réafficher le message au rafraîchissement
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:6001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur de connexion');
      }

      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect based on role
      if (data.user.role === 'admin') {
        navigate('/dashboard');
      } else if (data.user.role === 'resident') {
        navigate('/resident-space');
      } else {
        throw new Error('Rôle utilisateur non reconnu');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <FiUser size={32} style={{ color: '#2563eb' }} />
          <h1>Connexion</h1>
          <p>Connectez-vous pour accéder à votre espace</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="auth-error">
              <FiAlertCircle />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="auth-success">
              <FiCheckCircle />
              <span>{success}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-with-icon">
              <FiUser />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="votre@email.com"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <div className="input-with-icon">
              <FiLock />
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>

          <div className="auth-footer">
            <p>Première connexion ?</p>
            <button 
              type="button" 
              className="auth-link"
              onClick={() => navigate('/resident-first-login')}
            >
              Activer mon compte
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResidentLogin; 