import React, { useState, useEffect } from 'react';
import { FiPlus, FiSearch, FiFilter, FiUsers } from 'react-icons/fi';
import './Staff.css';

const API_URL = 'http://localhost:6001/api/staff';

const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [newStaff, setNewStaff] = useState({
    name: '',
    position: '',
    email: '',
    phone: '',
    salary: '',
    status: 'active'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterPosition, setFilterPosition] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Erreur lors du chargement du personnel');
      const data = await res.json();
      setStaff(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = () => {
    setIsAddingStaff(true);
    setIsEditing(false);
    setEditingStaff(null);
    setNewStaff({
      name: '',
      position: '',
      email: '',
      phone: '',
      salary: '',
      status: 'active'
    });
  };

  const handleEditStaff = (member) => {
    setIsEditing(true);
    setIsAddingStaff(true);
    setEditingStaff(member);
    setNewStaff({
      name: member.name,
      position: member.position,
      email: member.email,
      phone: member.phone,
      salary: member.salary,
      status: member.status
    });
  };

  const handleNewStaffChange = (e) => {
    const { name, value } = e.target;
    setNewStaff(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitNewStaff = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let res, result;
      const staffData = {
        ...newStaff,
        salary: Number(newStaff.salary)
      };
      if (isEditing && editingStaff) {
        res = await fetch(`${API_URL}/${editingStaff._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(staffData)
        });
        result = await res.json();
        if (!res.ok) throw new Error(result.message || 'Erreur lors de la modification');
      } else {
        res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(staffData)
        });
        result = await res.json();
        if (!res.ok) throw new Error(result.message || 'Erreur lors de la création');
      }
      setIsAddingStaff(false);
      setIsEditing(false);
      setEditingStaff(null);
      setNewStaff({
        name: '',
        position: '',
        email: '',
        phone: '',
        salary: '',
        status: 'active'
      });
      fetchStaff();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStaff = async (member) => {
    if (!window.confirm(`Supprimer le membre "${member.name}" ?`)) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/${member._id}`, {
        method: 'DELETE'
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Erreur lors de la suppression');
      fetchStaff();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getPositionColor = (position) => {
    switch (position) {
      case 'concierge':
        return '#2ecc71';
      case 'femme de ménage':
        return '#3498db';
      case 'garagiste':
        return '#e67e22';
      default:
        return '#95a5a6';
    }
  };

  return (
    <div className="dashboard-main-content">
      <div className="dashboard-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        borderBottom: '1px solid #e2e8f0',
        backgroundColor: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <FiUsers size={24} style={{ color: '#2563eb' }} />
          <span style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1e293b', letterSpacing: '0.025em' }}>
            Personnel de l'Immeuble
          </span>
        </div>
        <button onClick={handleAddStaff} className="add-staff-btn" disabled={loading}>
          <FiPlus /> <span>Ajouter membre</span>
        </button>
      </div>
      <div className="staff-controls" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', margin: '2rem 0 1.5rem 0', flexWrap: 'wrap' }}>
        <div className="search-container" style={{ flex: 1 }}>
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher un membre, poste ou téléphone..."
            value={searchTerm}
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
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Poste</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
              <button className="filter-pop-btn" style={{ textAlign: 'left', background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: filterPosition === 'all' ? '#2563eb' : '#1e293b', fontWeight: filterPosition === 'all' ? 600 : 400 }} onClick={() => { setFilterPosition('all'); setShowFilters(false); }}>Tous</button>
              <button className="filter-pop-btn" style={{ textAlign: 'left', background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: filterPosition === 'concierge' ? '#2563eb' : '#1e293b', fontWeight: filterPosition === 'concierge' ? 600 : 400 }} onClick={() => { setFilterPosition('concierge'); setShowFilters(false); }}>Concierge</button>
              <button className="filter-pop-btn" style={{ textAlign: 'left', background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: filterPosition === 'femme de ménage' ? '#2563eb' : '#1e293b', fontWeight: filterPosition === 'femme de ménage' ? 600 : 400 }} onClick={() => { setFilterPosition('femme de ménage'); setShowFilters(false); }}>Femme de ménage</button>
              <button className="filter-pop-btn" style={{ textAlign: 'left', background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: filterPosition === 'garagiste' ? '#2563eb' : '#1e293b', fontWeight: filterPosition === 'garagiste' ? 600 : 400 }} onClick={() => { setFilterPosition('garagiste'); setShowFilters(false); }}>Garagiste</button>
            </div>
            <div style={{ fontWeight: 600, marginBottom: 8, marginTop: 8 }}>Statut</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <button className="filter-pop-btn" style={{ textAlign: 'left', background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: filterStatus === 'all' ? '#2563eb' : '#1e293b', fontWeight: filterStatus === 'all' ? 600 : 400 }} onClick={() => { setFilterStatus('all'); setShowFilters(false); }}>Tous</button>
              <button className="filter-pop-btn" style={{ textAlign: 'left', background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: filterStatus === 'active' ? '#2563eb' : '#1e293b', fontWeight: filterStatus === 'active' ? 600 : 400 }} onClick={() => { setFilterStatus('active'); setShowFilters(false); }}>Actif</button>
              <button className="filter-pop-btn" style={{ textAlign: 'left', background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: filterStatus === 'inactive' ? '#2563eb' : '#1e293b', fontWeight: filterStatus === 'inactive' ? 600 : 400 }} onClick={() => { setFilterStatus('inactive'); setShowFilters(false); }}>Inactif</button>
            </div>
          </div>
        )}
      </div>
      <div className="dashboard-content" style={{ background: 'white', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', padding: '2rem', marginTop: '2rem' }}>
        {error && <div className="error-message">{error}</div>}

        {isAddingStaff && (
          <div className="add-staff-form">
            <h2>{isEditing ? 'Modifier le Membre' : 'Ajouter un Membre'}</h2>
            <form onSubmit={handleSubmitNewStaff}>
              <div className="form-row">
                <div className="form-group">
                  <label>Nom</label>
                  <input
                    type="text"
                    name="name"
                    value={newStaff.name}
                    onChange={handleNewStaffChange}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label>Poste</label>
                  <select
                    name="position"
                    value={newStaff.position}
                    onChange={handleNewStaffChange}
                    required
                    disabled={loading}
                  >
                    <option value="">Sélectionner un poste</option>
                    <option value="concierge">Concierge</option>
                    <option value="femme de ménage">Femme de ménage</option>
                    <option value="garagiste">Garagiste</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={newStaff.email}
                    onChange={handleNewStaffChange}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label>Téléphone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={newStaff.phone}
                    onChange={handleNewStaffChange}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Salaire Mensuel (€)</label>
                <input
                  type="number"
                  name="salary"
                  value={newStaff.salary}
                  onChange={handleNewStaffChange}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-button" disabled={loading}>
                  {isEditing ? 'Modifier' : 'Ajouter'}
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    setIsAddingStaff(false);
                    setIsEditing(false);
                    setEditingStaff(null);
                  }}
                  disabled={loading}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {loading && !isAddingStaff ? (
          <div className="loading-message">Chargement...</div>
        ) : (
          <div className="staff-table-container">
            <table className="staff-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Poste</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  <th>Salaire</th>
                  <th>Date d'embauche</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ height: '48px', textAlign: 'center', color: '#64748b' }}>Aucun membre du personnel</td>
                  </tr>
                ) : (
                  staff
                    .filter(member =>
                      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      member.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      member.phone.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .filter(member => filterPosition === 'all' || member.position === filterPosition)
                    .filter(member => filterStatus === 'all' || member.status === filterStatus)
                    .map(member => (
                      <tr key={member._id}>
                        <td style={{ fontWeight: 600, color: '#1e293b' }}>{member.name}<div style={{ fontSize: '0.95em', color: '#64748b' }}>{member.email}</div></td>
                        <td>
                          <span
                            className="position-badge"
                            style={{ backgroundColor: getPositionColor(member.position), color: 'white', fontWeight: 500 }}
                          >
                            {member.position}
                          </span>
                        </td>
                        <td>{member.email}</td>
                        <td>{member.phone}</td>
                        <td>{member.salary} € / mois</td>
                        <td>{member.hireDate ? new Date(member.hireDate).toLocaleDateString() : '-'}</td>
                        <td>
                          <span style={{
                            background: member.status === 'active' ? '#e0fbe0' : '#fee2e2',
                            color: member.status === 'active' ? '#15803d' : '#dc2626',
                            borderRadius: '8px',
                            padding: '0.25em 0.75em',
                            fontWeight: 500,
                            fontSize: '0.95em'
                          }}>{member.status === 'active' ? 'Actif' : 'Inactif'}</span>
                        </td>
                        <td style={{ display: 'flex', gap: 8 }}>
                          <button className="action-button edit" onClick={() => handleEditStaff(member)} disabled={loading}>
                            Modifier
                          </button>
                          <button className="action-button delete" onClick={() => handleDeleteStaff(member)} disabled={loading}>
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Staff; 