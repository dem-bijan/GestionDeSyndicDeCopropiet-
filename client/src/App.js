import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard/Dashboard';
import ResidentSpace from './components/Dashboard/ResidentSpace';
import ResidentLogin from './components/Auth/ResidentLogin';
import ResidentFirstLogin from './components/Auth/ResidentFirstLogin';
import './App.css';

// Protected Route component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const token = localStorage.getItem('token');

  if (!token || !user) {
    return <Navigate to="/resident-login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'resident') {
      return <Navigate to="/resident-space" replace />;
    } else if (user.role === 'admin') {
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/resident-login" replace />;
  }

  return children;
};

function App() {
  return (
    <div className="app">
    <Routes>
        {/* Admin Routes */}
        <Route 
          path="/dashboard/*" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Resident Routes */}
        <Route path="/resident-login" element={<ResidentLogin />} />
        <Route path="/resident-first-login" element={<ResidentFirstLogin />} />
        <Route 
          path="/resident-space" 
          element={
            <ProtectedRoute allowedRoles={['resident']}>
              <ResidentSpace />
            </ProtectedRoute>
          } 
        />
        
        {/* Default Route */}
        <Route path="/" element={<Navigate to="/resident-login" replace />} />
        {/* Catch-all Route */}
        <Route path="*" element={<Navigate to="/resident-login" replace />} />
    </Routes>
    </div>
  );
}

export default App;