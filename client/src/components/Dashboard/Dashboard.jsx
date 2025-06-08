import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { FiLogOut, FiHome } from 'react-icons/fi';
import Sidebar from './Sidebar';
import './Dashboard.css';

import GeneralInfo from './GeneralInfo';
import Residents from './Residents';
import Meetings from './Meetings';
import Repairs from './Repairs';
import Garage from './Garage';
import Staff from './Staff';
import Invoices from './Invoices';
import Messaging from './Messaging';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="dashboard-main">
        <div className="dashboard-header" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '1rem 2rem',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: 'white'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem'
          }}>
            <FiHome size={24} style={{ color: '#2563eb' }} />
            <span style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              color: '#1e293b',
              letterSpacing: '0.025em'
            }}>
              LeSyndic
            </span>
          </div>
          <button onClick={handleLogout} className="logout-button">
            <FiLogOut />
            <span>Déconnexion</span>
          </button>
        </div>

        <div className="dashboard-content">
          <Routes>
            <Route path="/" element={<GeneralInfo />} />
            <Route path="/residents" element={<Residents />} />
            <Route path="/meetings" element={<Meetings />} />
            <Route path="/repairs" element={<Repairs />} />
            <Route path="/garage" element={<Garage />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/messaging" element={<Messaging />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 