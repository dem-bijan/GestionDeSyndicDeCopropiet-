import React, { useState, useEffect } from 'react';
import { FiPlus, FiSearch, FiFilter, FiEdit2, FiTrash2, FiUser, FiTool, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import './Garage.css';

const API_URL = 'http://localhost:6001/api/garage';
const TOTAL_GARAGE_SPOTS = 30;

const Garage = () => {
  const [garageSpots, setGarageSpots] = useState([]);
  const [isAddingSpot, setIsAddingSpot] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSpot, setEditingSpot] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningSpot, setAssigningSpot] = useState(null);
  const [residents, setResidents] = useState([]);
  const [newSpot, setNewSpot] = useState({
    spotNumber: '',
    type: 'standard',
    monthlyFee: '',
    status: 'occupied',
    notes: '',
    vehicleInfo: {
      brand: '',
      model: '',
      licensePlate: '',
      owner: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchGarageSpots();
    fetchResidents();
  }, []);

  const fetchGarageSpots = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Erreur lors du chargement des places');
      const data = await res.json();
      setGarageSpots(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchResidents = async () => {
    try {
      const res = await fetch('http://localhost:6001/api/residents');
      if (!res.ok) throw new Error('Erreur lors du chargement des résidents');
      const data = await res.json();
      setResidents(data);
    } catch (err) {
      // Optionally handle error
    }
  };

  const handleAddSpot = () => {
    setIsAddingSpot(true);
    setIsEditing(false);
    setEditingSpot(null);
    setNewSpot({
      spotNumber: '',
      type: 'standard',
      monthlyFee: '',
      status: 'occupied',
      notes: '',
      vehicleInfo: {
        brand: '',
        model: '',
        licensePlate: '',
        owner: ''
      }
    });
  };

  const handleEditSpot = (spot) => {
    setIsEditing(true);
    setIsAddingSpot(true);
    setEditingSpot(spot);
    setNewSpot({
      spotNumber: spot.spotNumber,
      type: spot.type,
      monthlyFee: spot.monthlyFee,
      status: spot.status,
      notes: spot.notes || '',
      vehicleInfo: spot.vehicleInfo || {
        brand: '',
        model: '',
        licensePlate: '',
        owner: ''
      }
    });
  };

  const handleNewSpotChange = (e) => {
    const { name, value } = e.target;
    setNewSpot(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitNewSpot = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let res, result;
      const spotData = {
        ...newSpot,
        monthlyFee: Number(newSpot.monthlyFee),
        vehicleInfo: newSpot.vehicleInfo || {}
      };
      if (isEditing && editingSpot) {
        res = await fetch(`${API_URL}/${editingSpot._id || editingSpot.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(spotData)
        });
        result = await res.json();
        if (!res.ok) throw new Error(result.message || 'Erreur lors de la modification');
      } else {
        res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(spotData)
        });
        result = await res.json();
        if (!res.ok) throw new Error(result.message || 'Erreur lors de la création');
      }
      setIsAddingSpot(false);
      setIsEditing(false);
      setEditingSpot(null);
      setNewSpot({
        spotNumber: '',
        type: 'standard',
        monthlyFee: '',
        status: 'occupied',
        notes: '',
        vehicleInfo: {
          brand: '',
          model: '',
          licensePlate: '',
          owner: ''
        }
      });
      fetchGarageSpots();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSpot = async (spot) => {
    if (!window.confirm(`Supprimer la place "${spot.spotNumber}" ?`)) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/${spot._id || spot.id}`, {
        method: 'DELETE'
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Erreur lors de la suppression');
      fetchGarageSpots();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignSpot = (spot) => {
    setAssigningSpot(spot);
    setShowAssignModal(true);
  };

  const handleSelectResident = async (residentId) => {
    if (!assigningSpot) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/${assigningSpot._id || assigningSpot.id}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ residentId })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Erreur lors de l\'assignation');
      setShowAssignModal(false);
      setAssigningSpot(null);
      fetchGarageSpots();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMaintenance = async (spot) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/${spot._id || spot.id}/maintenance`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'maintenance' })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Erreur lors de la mise en maintenance');
      fetchGarageSpots();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return '#2ecc71';
      case 'occupied':
        return '#e74c3c';
      case 'maintenance':
        return '#f1c40f';
      default:
        return '#95a5a6';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available':
        return 'Disponible';
      case 'occupied':
        return 'Occupé';
      case 'maintenance':
        return 'En maintenance';
      default:
        return status;
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'standard':
        return 'Standard';
      case 'large':
        return 'Grand';
      case 'electric':
        return 'Électrique';
      default:
        return type;
    }
  };

  return (
    <div className="garage dashboard-centered-container">
      <div className="garage-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <FiTool size={24} style={{ color: '#2563eb' }} />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1e293b', margin: 0 }}>Gestion des Places de Parking</h1>
        </div>
        <button onClick={handleAddSpot} className="add-garage-btn" disabled={loading}>
          <FiPlus /> <span>Ajouter voiture</span>
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="garage-controls" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div className="search-container" style={{ flex: 1 }}>
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher une place, un propriétaire ou une plaque..."
            value={searchTerm || ''}
            onChange={e => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <button
          className="filter-btn"
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          aria-label="Filtrer"
        >
          <FiFilter style={{ marginRight: 6 }} />
          Filtrer
        </button>
        {showFilters && (
          <div className="filters-popover" style={{ position: 'absolute', top: 60, right: 0, zIndex: 10, background: 'white', borderRadius: '0.75rem', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', padding: '1rem', minWidth: 220 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Statut</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
              <button className="filter-pop-btn" style={{ textAlign: 'left', background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: filterStatus === 'all' ? '#2563eb' : '#1e293b', fontWeight: filterStatus === 'all' ? 600 : 400 }} onClick={() => { setFilterStatus('all'); setShowFilters(false); }}>Tous</button>
              <button className="filter-pop-btn" style={{ textAlign: 'left', background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: filterStatus === 'available' ? '#2563eb' : '#1e293b', fontWeight: filterStatus === 'available' ? 600 : 400 }} onClick={() => { setFilterStatus('available'); setShowFilters(false); }}>Disponible</button>
              <button className="filter-pop-btn" style={{ textAlign: 'left', background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: filterStatus === 'occupied' ? '#2563eb' : '#1e293b', fontWeight: filterStatus === 'occupied' ? 600 : 400 }} onClick={() => { setFilterStatus('occupied'); setShowFilters(false); }}>Occupé</button>
              <button className="filter-pop-btn" style={{ textAlign: 'left', background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: filterStatus === 'maintenance' ? '#2563eb' : '#1e293b', fontWeight: filterStatus === 'maintenance' ? 600 : 400 }} onClick={() => { setFilterStatus('maintenance'); setShowFilters(false); }}>Maintenance</button>
            </div>
            <div style={{ fontWeight: 600, marginBottom: 8, marginTop: 8 }}>Type</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <button className="filter-pop-btn" style={{ textAlign: 'left', background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: filterType === 'all' ? '#2563eb' : '#1e293b', fontWeight: filterType === 'all' ? 600 : 400 }} onClick={() => { setFilterType('all'); setShowFilters(false); }}>Tous</button>
              <button className="filter-pop-btn" style={{ textAlign: 'left', background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: filterType === 'standard' ? '#2563eb' : '#1e293b', fontWeight: filterType === 'standard' ? 600 : 400 }} onClick={() => { setFilterType('standard'); setShowFilters(false); }}>Standard</button>
              <button className="filter-pop-btn" style={{ textAlign: 'left', background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: filterType === 'large' ? '#2563eb' : '#1e293b', fontWeight: filterType === 'large' ? 600 : 400 }} onClick={() => { setFilterType('large'); setShowFilters(false); }}>Grand</button>
              <button className="filter-pop-btn" style={{ textAlign: 'left', background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: filterType === 'electric' ? '#2563eb' : '#1e293b', fontWeight: filterType === 'electric' ? 600 : 400 }} onClick={() => { setFilterType('electric'); setShowFilters(false); }}>Électrique</button>
            </div>
          </div>
        )}
      </div>

      {isAddingSpot && (
        <div className="add-spot-form">
          <h2>{isEditing ? 'Modifier la Place' : 'Ajouter une Voiture'}</h2>
          <form onSubmit={handleSubmitNewSpot}>
            <div className="form-row">
              <div className="form-group">
                <label>Numéro de Place</label>
                <input
                  type="text"
                  name="spotNumber"
                  value={newSpot.spotNumber}
                  onChange={handleNewSpotChange}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Type de Place</label>
                <select
                  name="type"
                  value={newSpot.type}
                  onChange={handleNewSpotChange}
                  required
                  disabled={loading}
                >
                  <option value="standard">Standard</option>
                  <option value="large">Grand</option>
                  <option value="electric">Électrique</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Marque du Véhicule</label>
                <input
                  type="text"
                  name="vehicleInfo.brand"
                  value={newSpot.vehicleInfo?.brand || ''}
                  onChange={handleNewSpotChange}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Modèle du Véhicule</label>
                <input
                  type="text"
                  name="vehicleInfo.model"
                  value={newSpot.vehicleInfo?.model || ''}
                  onChange={handleNewSpotChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Plaque d'Immatriculation</label>
                <input
                  type="text"
                  name="vehicleInfo.licensePlate"
                  value={newSpot.vehicleInfo?.licensePlate || ''}
                  onChange={handleNewSpotChange}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Propriétaire</label>
                <input
                  type="text"
                  name="vehicleInfo.owner"
                  value={newSpot.vehicleInfo?.owner || ''}
                  onChange={handleNewSpotChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Tarif Mensuel (€)</label>
              <input
                type="number"
                name="monthlyFee"
                value={newSpot.monthlyFee}
                onChange={handleNewSpotChange}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea
                name="notes"
                value={newSpot.notes}
                onChange={handleNewSpotChange}
                disabled={loading}
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="submit-button" disabled={loading}>
                {isEditing ? 'Modifier' : 'Ajouter la Voiture'}
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={() => {
                  setIsAddingSpot(false);
                  setIsEditing(false);
                  setEditingSpot(null);
                }}
                disabled={loading}
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="garage-stats">
        <div className="stat-card">
          <h3>Places Totales</h3>
          <p>{TOTAL_GARAGE_SPOTS}</p>
        </div>
        <div className="stat-card">
          <h3>Places Disponibles</h3>
          <p>{TOTAL_GARAGE_SPOTS - garageSpots.filter(spot => spot.status === 'occupied').length}</p>
        </div>
        <div className="stat-card">
          <h3>Places Occupées</h3>
          <p>{garageSpots.filter(spot => spot.status === 'occupied').length}</p>
        </div>
        <div className="stat-card">
          <h3>En Maintenance</h3>
          <p>{garageSpots.filter(spot => spot.status === 'maintenance').length}</p>
        </div>
      </div>

      <div className="garage-list">
        <h2>Liste des Places</h2>
        <div className="garage-grid">
          {garageSpots.map(spot => (
            <div key={spot._id || spot.id} className="spot-card">
              <div className="spot-header">
                <h3>Place {spot.spotNumber}</h3>
                <span
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(spot.status) }}
                >
                  {getStatusText(spot.status)}
                </span>
              </div>
              <div className="spot-details">
                <div className="spot-info">
                  <p className="spot-type">
                    <span className="icon">🚗</span>
                    {getTypeText(spot.type)}
                  </p>
                  <p className="spot-fee">
                    <span className="icon">€</span>
                    {spot.monthlyFee}€ / mois
                  </p>
                </div>
                <div className="spot-assignment">
                  <h4>Assigné à</h4>
                  <p>{spot.assignedTo ? spot.assignedTo.name : 'Non assigné'}</p>
                </div>
                <div className="spot-maintenance">
                  <h4>Maintenance</h4>
                  <p>Dernière: {spot.lastMaintenance ? new Date(spot.lastMaintenance).toLocaleDateString() : 'Jamais'}</p>
                  <p>Prochaine: {spot.nextMaintenance ? new Date(spot.nextMaintenance).toLocaleDateString() : 'Non planifiée'}</p>
                </div>
                {spot.notes && (
                  <div className="spot-notes">
                    <h4>Notes</h4>
                    <p>{spot.notes}</p>
                  </div>
                )}
              </div>
              <div className="spot-actions" style={{ justifyContent: 'center' }}>
                <button className="action-button edit" onClick={() => handleEditSpot(spot)} disabled={loading}>
                  Modifier
                </button>
                <button
                  className="action-button assign"
                  onClick={() => handleAssignSpot(spot)}
                  disabled={loading || spot.status === 'maintenance'}
                >
                  Assigner
                </button>
                <button
                  className="action-button maintenance"
                  onClick={() => handleMaintenance(spot)}
                  disabled={loading || spot.status === 'maintenance'}
                >
                  Maintenance
                </button>
                <button className="action-button delete" onClick={() => handleDeleteSpot(spot)} disabled={loading}>
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Assigner à un résident</h3>
            <ul className="assign-list">
              {residents.map((resident) => (
                <li key={resident._id || resident.id}>
                  <button
                    className="assign-resident-btn"
                    onClick={() => handleSelectResident(resident._id || resident.id)}
                    disabled={loading}
                  >
                    {resident.name}
                  </button>
                </li>
              ))}
            </ul>
            <button className="cancel-button" onClick={() => setShowAssignModal(false)} disabled={loading}>
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Garage; 