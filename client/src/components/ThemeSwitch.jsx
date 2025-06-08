import React from 'react';
import { useTheme } from '../context/ThemeContext';
import './ThemeSwitch.css';

const ThemeSwitch = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button 
      className={`theme-switch ${isDarkMode ? 'dark' : 'light'}`}
      onClick={toggleTheme}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      <div className="switch-track">
        <div className="switch-thumb">
          {isDarkMode ? '🌙' : '☀️'}
        </div>
      </div>
    </button>
  );
};

export default ThemeSwitch; 