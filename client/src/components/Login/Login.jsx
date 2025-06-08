import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setLogin } from '../../state';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check for test admin account
    if (formData.email === 'admin@example.com' && formData.password === 'adminadmin') {
      // Dispatch login action
      dispatch(
        setLogin({
          user: {
            email: formData.email,
            role: 'admin'
          },
          token: 'test-token',
          isAdmin: true
        })
      );
      // Navigate to dashboard
      navigate('/dashboard');
    } else {
      setError('Email ou mot de passe incorrect');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Syndic de Copropriété</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="admin@example.com"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="adminadmin"
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="login-button">
            Se connecter
          </button>
        </form>
        <div className="test-account-info">
          <p>Compte de test:</p>
          <p>Email: admin@example.com</p>
          <p>Mot de passe: adminadmin</p>
        </div>
      </div>
    </div>
  );
};

export default Login; 