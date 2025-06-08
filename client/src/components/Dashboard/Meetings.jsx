import React, { useState, useEffect } from 'react';
import { FiCalendar, FiMapPin, FiEdit2, FiTrash2, FiPlus, FiFilter } from 'react-icons/fi';
import './Meetings.css';

const STATUS_LABELS = {
  scheduled: { label: 'Planifiée', color: '#e3edff', textColor: '#1e40af' },
  completed: { label: 'Terminé', color: '#f3eaff', textColor: '#6b21a8' },
  cancelled: { label: 'Annulé', color: '#fee2e2', textColor: '#dc2626' }
};

const Meetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAddingMeeting, setIsAddingMeeting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    status: 'scheduled',
    notes: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:6001/api/meetings');
      if (!response.ok) throw new Error('Erreur lors du chargement des réunions');
      const data = await response.json();
      setMeetings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => setSearchTerm(e.target.value);

  const handleAddMeeting = () => {
    setIsAddingMeeting(true);
    setIsEditing(false);
    setEditingMeeting(null);
    setNewMeeting({
      title: '',
      date: '',
      time: '',
      location: '',
      status: 'scheduled',
      notes: ''
    });
  };

  const handleEditMeeting = (meeting) => {
    setIsEditing(true);
    setIsAddingMeeting(true);
    setEditingMeeting(meeting);
    setNewMeeting({
      title: meeting.title,
      date: meeting.date,
      time: meeting.time,
      location: meeting.location,
      status: meeting.status,
      notes: meeting.notes
    });
  };

  const handleCancel = () => {
    setIsAddingMeeting(false);
    setIsEditing(false);
    setEditingMeeting(null);
    setNewMeeting({
      title: '',
      date: '',
      time: '',
      location: '',
      status: 'scheduled',
      notes: ''
    });
  };

  const handleNewMeetingChange = (e) => {
    const { name, value } = e.target;
    setNewMeeting(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitNewMeeting = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let res, result;
      if (isEditing && editingMeeting) {
        res = await fetch(`http://localhost:6001/api/meetings/${editingMeeting._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newMeeting)
        });
        result = await res.json();
        if (!res.ok) throw new Error(result.message || 'Erreur lors de la modification de la réunion');
      } else {
        res = await fetch('http://localhost:6001/api/meetings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newMeeting)
        });
        result = await res.json();
        if (!res.ok) throw new Error(result.message || 'Erreur lors de l\'ajout de la réunion');
      }
      setIsAddingMeeting(false);
      setIsEditing(false);
      setEditingMeeting(null);
      fetchMeetings();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMeeting = async (meeting) => {
    if (!window.confirm(`Supprimer la réunion "${meeting.title}" ?`)) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`http://localhost:6001/api/meetings/${meeting._id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Erreur lors de la suppression de la réunion');
      fetchMeetings();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meeting.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || meeting.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="meetings-page">
      <div className="meetings-header">
        <div className="meetings-header-content">
      <h1>Réunions de Copropriété</h1>
          <button className="add-meeting-btn" style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.6em 1.5em', fontSize: '1.05em', fontWeight: 600, boxShadow: '0 2px 8px rgba(37,99,235,0.10)', cursor: 'pointer', transition: 'background 0.2s' }} onClick={handleAddMeeting} disabled={loading} onMouseOver={e => e.currentTarget.style.background='#1e40af'} onMouseOut={e => e.currentTarget.style.background='#2563eb'}>
            <FiPlus style={{ marginRight: 8 }} /> Ajouter une réunion
          </button>
        </div>
      </div>

      <div className="meetings-controls" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div className="search-container" style={{ flex: 1 }}>
          <FiCalendar className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher une réunion..."
            value={searchTerm}
            onChange={handleSearch}
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
              <button className="filter-pop-btn" style={{ textAlign: 'left', background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: filterStatus === 'scheduled' ? '#2563eb' : '#1e293b', fontWeight: filterStatus === 'scheduled' ? 600 : 400 }} onClick={() => { setFilterStatus('scheduled'); setShowFilters(false); }}>Planifiées</button>
              <button className="filter-pop-btn" style={{ textAlign: 'left', background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: filterStatus === 'completed' ? '#2563eb' : '#1e293b', fontWeight: filterStatus === 'completed' ? 600 : 400 }} onClick={() => { setFilterStatus('completed'); setShowFilters(false); }}>Terminées</button>
              <button className="filter-pop-btn" style={{ textAlign: 'left', background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: filterStatus === 'cancelled' ? '#2563eb' : '#1e293b', fontWeight: filterStatus === 'cancelled' ? 600 : 400 }} onClick={() => { setFilterStatus('cancelled'); setShowFilters(false); }}>Annulées</button>
            </div>
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {isAddingMeeting && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{isEditing ? 'Modifier la Réunion' : 'Ajouter une Nouvelle Réunion'}</h2>
            <form onSubmit={handleSubmitNewMeeting} className="meeting-form">
              <div className="form-group">
                <label>Titre</label>
                <input
                  type="text"
                  name="title"
                  value={newMeeting.title}
                  onChange={handleNewMeetingChange}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  name="date"
                  value={newMeeting.date}
                  onChange={handleNewMeetingChange}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Heure</label>
                <input
                  type="time"
                  name="time"
                  value={newMeeting.time}
                  onChange={handleNewMeetingChange}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Lieu</label>
                <input
                  type="text"
                  name="location"
                  value={newMeeting.location}
                  onChange={handleNewMeetingChange}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={isEditing ? editingMeeting?.description || '' : newMeeting.description}
                  onChange={handleNewMeetingChange}
                  required
                  disabled={loading}
                  rows="3"
                />
              </div>
              {isEditing && (
                <div className="form-group">
                  <label>Statut</label>
                  <select
                    name="status"
                    value={editingMeeting?.status}
                    onChange={handleNewMeetingChange}
                    required
                    disabled={loading}
                  >
                    <option value="scheduled">Planifiée</option>
                    <option value="completed">Terminée</option>
                    <option value="cancelled">Annulée</option>
                  </select>
                </div>
              )}
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={newMeeting.notes}
                  onChange={handleNewMeetingChange}
                  disabled={loading}
                  rows="3"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-btn" disabled={loading}>
                  {isEditing ? 'Modifier' : 'Ajouter'}
                </button>
                <button type="button" className="cancel-btn" onClick={handleCancel} disabled={loading}>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-message">Chargement...</div>
      ) : filteredMeetings.length === 0 ? (
        <div className="meetings-table-container" style={{ marginTop: '1.5rem', background: '#fff', borderRadius: '16px', boxShadow: '0 2px 12px rgba(37,99,235,0.07)', padding: '1.5rem 1.2rem 1.2rem 1.2rem' }}>
          <table className="meetings-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5em', fontSize: '1rem' }}>
            <thead>
              <tr>
                <th style={{ background: '#f0f9ff', color: '#2563eb', fontWeight: 700, borderRadius: '12px 12px 0 0', fontSize: '1.08em', padding: '0.85em 1.1em', textAlign: 'left' }}>Titre</th>
                <th style={{ background: '#f0f9ff', color: '#2563eb', fontWeight: 700, borderRadius: '12px 12px 0 0', fontSize: '1.08em', padding: '0.85em 1.1em', textAlign: 'left' }}>Date</th>
                <th style={{ background: '#f0f9ff', color: '#2563eb', fontWeight: 700, borderRadius: '12px 12px 0 0', fontSize: '1.08em', padding: '0.85em 1.1em', textAlign: 'left' }}>Heure</th>
                <th style={{ background: '#f0f9ff', color: '#2563eb', fontWeight: 700, borderRadius: '12px 12px 0 0', fontSize: '1.08em', padding: '0.85em 1.1em', textAlign: 'left' }}>Lieu</th>
                <th style={{ background: '#f0f9ff', color: '#2563eb', fontWeight: 700, borderRadius: '12px 12px 0 0', fontSize: '1.08em', padding: '0.85em 1.1em', textAlign: 'left' }}>Statut</th>
              </tr>
            </thead>
            <tbody>
              <tr><td colSpan={5} style={{ textAlign: 'center', color: '#64748b', height: 48 }}>Aucune réunion</td></tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="meetings-table-container" style={{ marginTop: '1.5rem', background: '#fff', borderRadius: '16px', boxShadow: '0 2px 12px rgba(37,99,235,0.07)', padding: '1.5rem 1.2rem 1.2rem 1.2rem' }}>
          <table className="meetings-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5em', fontSize: '1rem' }}>
            <thead>
              <tr>
                <th style={{ background: '#f0f9ff', color: '#2563eb', fontWeight: 700, borderRadius: '12px 12px 0 0', fontSize: '1.08em', padding: '0.85em 1.1em', textAlign: 'left' }}>Titre</th>
                <th style={{ background: '#f0f9ff', color: '#2563eb', fontWeight: 700, borderRadius: '12px 12px 0 0', fontSize: '1.08em', padding: '0.85em 1.1em', textAlign: 'left' }}>Date</th>
                <th style={{ background: '#f0f9ff', color: '#2563eb', fontWeight: 700, borderRadius: '12px 12px 0 0', fontSize: '1.08em', padding: '0.85em 1.1em', textAlign: 'left' }}>Heure</th>
                <th style={{ background: '#f0f9ff', color: '#2563eb', fontWeight: 700, borderRadius: '12px 12px 0 0', fontSize: '1.08em', padding: '0.85em 1.1em', textAlign: 'left' }}>Lieu</th>
                <th style={{ background: '#f0f9ff', color: '#2563eb', fontWeight: 700, borderRadius: '12px 12px 0 0', fontSize: '1.08em', padding: '0.85em 1.1em', textAlign: 'left' }}>Statut</th>
              </tr>
            </thead>
            <tbody>
              {filteredMeetings.map(meeting => (
                <tr key={meeting._id} style={{ background: '#fff', boxShadow: '0 2px 10px rgba(37,99,235,0.09)', borderRadius: '16px', transition: 'box-shadow 0.2s' }}>
                  <td style={{ fontWeight: 600, color: '#1e293b', padding: '0.85em 1.1em', borderTop: 'none', borderBottom: '1px solid #f1f5f9' }}>{meeting.title}</td>
                  <td style={{ padding: '0.85em 1.1em', borderTop: 'none', borderBottom: '1px solid #f1f5f9' }}>{new Date(meeting.date).toLocaleDateString()}</td>
                  <td style={{ padding: '0.85em 1.1em', borderTop: 'none', borderBottom: '1px solid #f1f5f9' }}>{meeting.time}</td>
                  <td style={{ padding: '0.85em 1.1em', borderTop: 'none', borderBottom: '1px solid #f1f5f9' }}>{meeting.location}</td>
                  <td style={{ padding: '0.85em 1.1em', borderTop: 'none', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{
                      background: STATUS_LABELS[meeting.status]?.color,
                      color: STATUS_LABELS[meeting.status]?.textColor,
                      borderRadius: '8px',
                      padding: '0.25em 0.75em',
                      fontWeight: 500,
                      fontSize: '0.95em'
                    }}>{STATUS_LABELS[meeting.status]?.label || meeting.status}</span>
                  </td>
                </tr>
          ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Meetings; 