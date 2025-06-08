import React, { useState, useEffect } from 'react';
import { FiTool, FiMapPin, FiAlertCircle, FiEdit2, FiTrash2, FiPlus, FiCheck, FiFilter } from 'react-icons/fi';
import './Repairs.css';

const API_URL = 'http://localhost:6001/api/repairs';
const STAFF_API_URL = 'http://localhost:6001/api/staff';

const PRIORITY_LABELS = {
  high: { label: 'Haute', color: '#fee2e2', textColor: '#dc2626' },
  medium: { label: 'Moyenne', color: '#fef3c7', textColor: '#d97706' },
  low: { label: 'Basse', color: '#dcfce7', textColor: '#16a34a' }
};

const STATUS_LABELS = {
  pending: { label: 'En attente', color: '#e3edff', textColor: '#1e40af' },
  in_progress: { label: 'En cours', color: '#f3eaff', textColor: '#6b21a8' },
  completed: { label: 'Terminé', color: '#f0fdf4', textColor: '#15803d' }
};

const Repairs = () => {
  const [repairs, setRepairs] = useState([]);
  const [isAddingRepair, setIsAddingRepair] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingRepair, setEditingRepair] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningRepair, setAssigningRepair] = useState(null);
  const [activeStaff, setActiveStaff] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [newRepair, setNewRepair] = useState({
    title: '',
    description: '',
    location: '',
    priority: 'medium',
    assignedStaff: [],
    status: 'pending',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchRepairs();
    fetchStaff();
  }, []);

  const fetchRepairs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Erreur lors du chargement des réparations');
      const data = await res.json();
      setRepairs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await fetch(STAFF_API_URL);
      if (!res.ok) throw new Error('Erreur lors du chargement du personnel');
      const data = await res.json();
      setActiveStaff(data.filter((s) => s.status === 'active'));
    } catch (err) {
      // Optionally handle error
    }
  };

  const handleAddRepair = () => {
    setIsAddingRepair(true);
    setIsEditing(false);
    setEditingRepair(null);
    setNewRepair({
      title: '',
      description: '',
      location: '',
      priority: 'medium',
      assignedStaff: [],
      status: 'pending',
    });
  };

  const handleEditRepair = (repair) => {
    setIsEditing(true);
    setIsAddingRepair(true);
    setEditingRepair(repair);
    setNewRepair({
      title: repair.title,
      description: repair.description,
      location: repair.location,
      priority: repair.priority,
      assignedStaff: repair.assignedStaff ? repair.assignedStaff.map(s => s._id || s) : [],
      status: repair.status,
    });
  };

  const handleNewRepairChange = (e) => {
    const { name, value } = e.target;
    setNewRepair((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitNewRepair = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let res, result;
      const repairData = {
        ...newRepair,
        status: isEditing ? newRepair.status : 'pending',
      };
      if (isEditing && editingRepair) {
        res = await fetch(`${API_URL}/${editingRepair._id || editingRepair.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(repairData),
        });
        result = await res.json();
        if (!res.ok) throw new Error(result.message || 'Erreur lors de la modification');
      } else {
        res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(repairData),
        });
        result = await res.json();
        if (!res.ok) throw new Error(result.message || 'Erreur lors de la création');
      }
      setIsAddingRepair(false);
      setIsEditing(false);
      setEditingRepair(null);
      setNewRepair({
        title: '',
        description: '',
        location: '',
        priority: 'medium',
        assignedStaff: [],
        status: 'pending',
      });
      fetchRepairs();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRepair = async (repair) => {
    if (!window.confirm(`Supprimer la réparation "${repair.title}" ?`)) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/${repair._id || repair.id}`, {
        method: 'DELETE',
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Erreur lors de la suppression');
      fetchRepairs();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRepair = async (repair) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/${repair._id || repair.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Erreur lors de la complétion');
      fetchRepairs();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRepair = (repair) => {
    setAssigningRepair(repair);
    setShowAssignModal(true);
  };

  const handleSelectStaff = async (staffId) => {
    if (!assigningRepair) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/${assigningRepair._id || assigningRepair.id}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffIds: [staffId] }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Erreur lors de l\'assignation');
      setShowAssignModal(false);
      setAssigningRepair(null);
      fetchRepairs();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredRepairs = repairs.filter(repair => {
    const matchesSearch = repair.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         repair.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || repair.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || repair.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="repairs-page">
      <div className="repairs-header">
        <div className="repairs-header-content">
          <h1>Gestion des Réparations</h1>
          <button className="add-repair-btn" onClick={handleAddRepair} disabled={loading}>
            <FiPlus />
            <span>Nouvelle Réparation</span>
          </button>
        </div>
      </div>

      <div className="repairs-controls" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div className="search-container" style={{ flex: 1 }}>
          <FiTool className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher une réparation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <button className="filter-pop-btn" style={{ textAlign: 'left', background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: filterStatus === 'all' ? '#2563eb' : '#1e293b', fontWeight: filterStatus === 'all' ? 600 : 400 }} onClick={() => { setFilterStatus('all'); setShowFilters(false); }}>Toutes</button>
              <button className="filter-pop-btn" style={{ textAlign: 'left', background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: filterStatus === 'pending' ? '#2563eb' : '#1e293b', fontWeight: filterStatus === 'pending' ? 600 : 400 }} onClick={() => { setFilterStatus('pending'); setShowFilters(false); }}>En attente</button>
              <button className="filter-pop-btn" style={{ textAlign: 'left', background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: filterStatus === 'in_progress' ? '#2563eb' : '#1e293b', fontWeight: filterStatus === 'in_progress' ? 600 : 400 }} onClick={() => { setFilterStatus('in_progress'); setShowFilters(false); }}>En cours</button>
              <button className="filter-pop-btn" style={{ textAlign: 'left', background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: filterStatus === 'completed' ? '#2563eb' : '#1e293b', fontWeight: filterStatus === 'completed' ? 600 : 400 }} onClick={() => { setFilterStatus('completed'); setShowFilters(false); }}>Terminées</button>
            </div>
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {isAddingRepair && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{isEditing ? 'Modifier la Réparation' : 'Nouvelle Réparation'}</h2>
            <form onSubmit={handleSubmitNewRepair} className="repair-form">
              <div className="form-group">
                <label>Titre</label>
                <input
                  type="text"
                  name="title"
                  value={newRepair.title}
                  onChange={handleNewRepairChange}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={newRepair.description}
                  onChange={handleNewRepairChange}
                  required
                  disabled={loading}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Lieu</label>
                <input
                  type="text"
                  name="location"
                  value={newRepair.location}
                  onChange={handleNewRepairChange}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Priorité</label>
                <select
                  name="priority"
                  value={newRepair.priority}
                  onChange={handleNewRepairChange}
                  required
                  disabled={loading}
                >
                  <option value="high">Haute</option>
                  <option value="medium">Moyenne</option>
                  <option value="low">Basse</option>
                </select>
              </div>
              {isEditing && (
                <div className="form-group">
                  <label>Statut</label>
                  <select
                    name="status"
                    value={newRepair.status}
                    onChange={handleNewRepairChange}
                    required
                    disabled={loading}
                  >
                    <option value="pending">En attente</option>
                    <option value="in_progress">En cours</option>
                    <option value="completed">Terminé</option>
                  </select>
                </div>
              )}
              <div className="form-actions">
                <button type="submit" className="submit-btn" disabled={loading}>
                  {isEditing ? 'Modifier' : 'Ajouter'}
                </button>
                <button type="button" className="cancel-btn" onClick={() => setIsAddingRepair(false)} disabled={loading}>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAssignModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Assigner un Technicien</h2>
            <div className="staff-list">
              {activeStaff.map(staff => (
                <button
                  key={staff._id}
                  className="staff-item"
                  onClick={() => handleSelectStaff(staff._id)}
                  disabled={loading}
                >
                  {staff.name}
                </button>
              ))}
            </div>
            <div className="form-actions">
              <button className="cancel-btn" onClick={() => setShowAssignModal(false)} disabled={loading}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="repairs-table-container">
        <table className="repairs-table">
          <thead>
            <tr>
              <th>Titre</th>
              <th>Lieu</th>
              <th>Priorité</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRepairs.map(repair => (
              <tr key={repair._id}>
                <td>
                  <div className="repair-info">
                    <span className="repair-title">{repair.title}</span>
                    {repair.description && <span className="repair-description">{repair.description}</span>}
                  </div>
                </td>
                <td>
                  <div className="repair-location">
                    <FiMapPin />
                    <span>{repair.location}</span>
                  </div>
                </td>
                <td>
                  <span
                    className="priority-badge"
                    style={{
                      backgroundColor: PRIORITY_LABELS[repair.priority]?.color || '#f1f5f9',
                      color: PRIORITY_LABELS[repair.priority]?.textColor || '#64748b',
                      fontWeight: 600
                    }}
                  >
                    {PRIORITY_LABELS[repair.priority]?.label || 'Non définie'}
                  </span>
                </td>
                <td>
                  <span
                    className="status-badge"
                    style={{
                      backgroundColor: STATUS_LABELS[repair.status]?.color,
                      color: STATUS_LABELS[repair.status]?.textColor
                    }}
                  >
                    {STATUS_LABELS[repair.status]?.label || 'Inconnu'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    {repair.status !== 'completed' && (
                      <button 
                        className="action-btn complete"
                        onClick={() => handleCompleteRepair(repair)}
                        disabled={loading}
                        title="Terminer"
                      >
                        <FiCheck />
                      </button>
                    )}
                    <button 
                      className="action-btn view"
                      onClick={() => handleEditRepair(repair)}
                      disabled={loading}
                      title="Modifier"
                    >
                      <FiEdit2 />
                    </button>
                    <button 
                      className="action-btn delete"
                      onClick={() => handleDeleteRepair(repair)}
                      disabled={loading}
                      title="Supprimer"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Repairs; 