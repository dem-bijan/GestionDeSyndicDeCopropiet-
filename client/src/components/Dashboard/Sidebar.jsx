import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';
import './Sidebar.css';

const Sidebar = () => {
  const menuItems = [
    { path: '/dashboard', label: 'Général', icon: '📊' },
    { path: '/dashboard/residents', label: 'Résidents', icon: '👥' },
    { path: '/dashboard/meetings', label: 'Réunions', icon: '📅' },
    { path: '/dashboard/repairs', label: 'Réparations', icon: '🔧' },
    { path: '/dashboard/garage', label: 'Garage', icon: '🚗' },
    { path: '/dashboard/staff', label: 'Personnel', icon: '👷' },
    { path: '/dashboard/invoices', label: 'Factures', icon: '📄' },
    { path: '/dashboard/messaging', label: 'Messagerie', icon: '✉️' },
  ];

  return (
    <div className="sidebar" style={{ backgroundColor: '#1e293b' }}>
      <div className="sidebar-header" style={{ 
        padding: '1.5rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <FiHome size={24} style={{ color: '#60a5fa' }} />
        <span style={{ 
          fontSize: '1.5rem', 
          fontWeight: '600', 
          color: 'white',
          letterSpacing: '0.025em'
        }}>
          LeSyndic
        </span>
      </div>
      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive ? 'menu-item active' : 'menu-item'
            }
            style={({ isActive }) => ({
              color: isActive ? '#60a5fa' : 'rgba(255, 255, 255, 0.7)',
              backgroundColor: isActive ? 'rgba(96, 165, 250, 0.1)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white'
              }
            })}
          >
            <span className="menu-icon">{item.icon}</span>
            <span className="menu-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar; 