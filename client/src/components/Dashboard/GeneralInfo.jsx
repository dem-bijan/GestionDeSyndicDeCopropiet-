import React, { useState, useEffect } from 'react';
import { FiHome, FiUsers, FiCalendar, FiTool, FiTruck, FiFileText } from 'react-icons/fi';
import './GeneralInfo.css';

const TOTAL_APPARTEMENTS = 50;
const TOTAL_GARAGE_SPOTS = 30;

const GeneralInfo = () => {
  const [stats, setStats] = useState({
    totalResidents: 0,
    occupiedApartments: 0,
    availableApartments: 0,
    upcomingMeetings: 0,
    inProgressRepairs: 0,
    occupiedGarageSpots: 0,
    unpaidInvoices: 0
  });

  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [residentsRes, meetingsRes, repairsRes, garageRes, invoicesRes] = await Promise.all([
          fetch('http://localhost:6001/api/residents'),
          fetch('http://localhost:6001/api/meetings'),
          fetch('http://localhost:6001/api/repairs'),
          fetch('http://localhost:6001/api/garage'),
          fetch('http://localhost:6001/api/invoices')
        ]);

        const [residents, meetings, repairs, garage, invoices] = await Promise.all([
          residentsRes.json(),
          meetingsRes.json(),
          repairsRes.json(),
          garageRes.json(),
          invoicesRes.json()
        ]);

        // Calculate statistics
        const occupiedApartments = new Set(residents.map(r => r.apartment)).size;
        const upcomingMeetings = meetings.filter(m => m.status === 'upcoming').length;
        const inProgressRepairs = repairs.filter(r => r.status === 'in_progress').length;
        const occupiedGarageSpots = garage.filter(g => g.status === 'occupied').length;
        const unpaidInvoices = invoices.filter(i => i.status === 'unpaid').length;

        setStats({
          totalResidents: residents.length,
          occupiedApartments,
          availableApartments: TOTAL_APPARTEMENTS - occupiedApartments,
          upcomingMeetings,
          inProgressRepairs,
          occupiedGarageSpots,
          unpaidInvoices
        });
        setError('');
      } catch (err) {
        setError(err.message || 'Erreur lors du chargement des données');
      }
    };

    fetchStats();
    const intervalId = setInterval(fetchStats, 5000); // refresh every 5 seconds
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="general-info">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FiHome />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.occupiedApartments}/{TOTAL_APPARTEMENTS}</span>
            <span className="stat-label">Appartements occupés</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FiUsers />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalResidents}</span>
            <span className="stat-label">Résidents</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FiCalendar />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.upcomingMeetings}</span>
            <span className="stat-label">Réunions à venir</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FiTool />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.inProgressRepairs}</span>
            <span className="stat-label">Réparations en cours</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FiTruck />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.occupiedGarageSpots}/{TOTAL_GARAGE_SPOTS}</span>
            <span className="stat-label">Places de garage occupées</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FiFileText />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.unpaidInvoices}</span>
            <span className="stat-label">Factures impayées</span>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="recent-activity card">
        <h2>Activité Récente</h2>
        <div className="activity-list">
          <div className="activity-item">
            <span className="activity-icon">🔧</span>
            <div className="activity-content">
              <p className="activity-title">Réparation de l'ascenseur</p>
              <p className="activity-time">Il y a 2 heures</p>
            </div>
          </div>
          <div className="activity-item">
            <span className="activity-icon">📅</span>
            <div className="activity-content">
              <p className="activity-title">Nouvelle réunion programmée</p>
              <p className="activity-time">Il y a 1 jour</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralInfo; 