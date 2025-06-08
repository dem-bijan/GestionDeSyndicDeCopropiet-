import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiLock, FiAlertCircle, FiKey } from 'react-icons/fi';
import './Auth.css';

const ResidentFirstLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validatePassword = () => {
    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }
    return true;
  };

  const handleFirstLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!validatePassword()) {
      return;
    }

    setLoading(true);

    try {
      // TODO: Appel API pour enregistrer le mot de passe lors de la première connexion
      // Pour l'instant, simulation
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Rediriger vers la page de connexion
      navigate('/resident-login', {
        state: { message: 'Compte activé avec succès ! Vous pouvez maintenant vous connecter.' }
      });
    } catch (err) {
      setError('Erreur lors de l\'activation du compte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <FiKey size={32} style={{ color: '#2563eb' }} />
          <h1>Première connexion</h1>
          <p>Entrez votre email et choisissez un mot de passe</p>
        </div>

        <form onSubmit={handleFirstLogin} className="auth-form">
          {error && (
            <div className="auth-error">
              <FiAlertCircle />
              <span>{error}</span>
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
            <label htmlFor="password">Nouveau mot de passe</label>
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

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
            <div className="input-with-icon">
              <FiLock />
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
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
            {loading ? 'Activation...' : 'Activer mon compte'}
          </button>

          <div className="auth-footer">
            <p>Déjà activé ?</p>
            <button
              type="button"
              className="auth-link"
              onClick={() => navigate('/resident-login')}
            >
              Se connecter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResidentFirstLogin; 