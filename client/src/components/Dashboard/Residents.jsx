import React, { useState, useEffect } from 'react';
import './Residents.css';
import { FiUserPlus, FiSearch, FiEye, FiTrash2, FiFileText, FiUsers, FiHome, FiCalendar, FiFilter } from 'react-icons/fi';

const API_URL = 'http://localhost:6001/api/residents';
const INVOICE_API_URL = 'http://localhost:6001/api/invoices';

const STATUS_LABELS = {
  proprietaire: { label: 'Propriétaire', color: '#e3edff', textColor: '#1e40af' },
  locataire: { label: 'Locataire', color: '#f3eaff', textColor: '#6b21a8' },
};
const PAYMENT_LABELS = {
  paye: { label: 'Payé', color: '#e6f9ed' },
  attente: { label: 'En attente', color: '#fffbe6' },
  retard: { label: 'En retard', color: '#ffeaea' },
};

const Residents = () => {
  const [residents, setResidents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAddingResident, setIsAddingResident] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingResident, setEditingResident] = useState(null);
  const [newResident, setNewResident] = useState({
    name: '',
    email: '',
    apartment: '',
    phone: '',
    status: 'proprietaire',
    entryDate: '',
    payment: 'paye',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedResident, setSelectedResident] = useState(null);
  const [residentInvoices, setResidentInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [stats, setStats] = useState({
    totalResidents: 0,
    proprietaires: 0,
    locataires: 0
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch residents from API
  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Erreur lors du chargement des résidents');
      const data = await res.json();
      setResidents(data);
      
      // Calculate stats
      setStats({
        totalResidents: data.length,
        proprietaires: data.filter(r => r.status === 'proprietaire').length,
        locataires: data.filter(r => r.status === 'locataire').length
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => setSearchTerm(e.target.value);
  const handleFilter = (e) => setFilterStatus(e.target.value);

  const handleAddResident = () => {
    setIsAddingResident(true);
    setIsEditing(false);
    setEditingResident(null);
    setNewResident({
      name: '',
      email: '',
      apartment: '',
      phone: '',
      status: 'proprietaire',
      entryDate: '',
      payment: 'paye',
    });
    setMessage('');
    setError('');
  };

  const handleEditResident = (resident) => {
    setIsEditing(true);
    setIsAddingResident(true);
    setEditingResident(resident);
    setNewResident({
      name: resident.name,
      email: resident.email,
      apartment: resident.apartment,
      phone: resident.phone,
      status: resident.status,
      entryDate: resident.entryDate,
      payment: resident.payment,
    });
    setMessage('');
    setError('');
  };

  const handleCancel = () => {
    setIsAddingResident(false);
    setIsEditing(false);
    setEditingResident(null);
    setNewResident({
      name: '',
      email: '',
      apartment: '',
      phone: '',
      status: 'proprietaire',
      entryDate: '',
      payment: 'paye',
    });
    setError('');
    setMessage('');
  };

  const handleNewResidentChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewResident(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmitNewResident = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      let res, result;
      if (isEditing && editingResident) {
        // PUT (update)
        res = await fetch(`${API_URL}/${editingResident._id || editingResident.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newResident)
        });
        result = await res.json();
        if (!res.ok) throw new Error(result.message || 'Erreur lors de la modification du résident');
        setMessage('Résident modifié avec succès !');
      } else {
        // POST (create)
        res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newResident)
        });
        result = await res.json();
        if (!res.ok) throw new Error(result.message || 'Erreur lors de l\'ajout du résident');
        setMessage('Résident ajouté avec succès !');
      }
      setIsAddingResident(false);
      setIsEditing(false);
      setEditingResident(null);
      setNewResident({
        name: '',
        email: '',
        apartment: '',
        phone: '',
        status: 'proprietaire',
        entryDate: '',
        payment: 'paye',
      });
      fetchResidents();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResident = async (resident) => {
    if (!window.confirm(`Supprimer le résident ${resident.name} ?`)) return;
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch(`${API_URL}/${resident._id || resident.id}`, {
        method: 'DELETE'
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Erreur lors de la suppression du résident');
      setMessage('Résident supprimé avec succès !');
      fetchResidents();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShowInvoices = async (resident) => {
    setSelectedResident(resident);
    setShowInvoiceModal(true);
    setLoadingInvoices(true);
    try {
      const res = await fetch(`${INVOICE_API_URL}/resident/${resident._id || resident.id}/unpaid`);
      const data = await res.json();
      setResidentInvoices(data);
    } catch (err) {
      setResidentInvoices([]);
    } finally {
      setLoadingInvoices(false);
    }
  };

  // Filter out apartments already used by other residents
  const availableApartments = [...Array(50)].map((_, i) => `Appartement ${i + 1}`).filter(apt => !residents.some(r => r.apartment === apt));

  const filteredResidents = residents.filter(resident => {
    const matchesSearch =
      resident.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.apartment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'proprietaire' && resident.status === 'proprietaire') ||
      (filterStatus === 'locataire' && resident.status === 'locataire');
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="residents-page">
      <div className="residents-header">
        <div className="residents-header-content">
          <h1>Gestion des résidents</h1>
          <button className="add-resident-btn" onClick={handleAddResident} disabled={loading}>
            <FiUserPlus />
            <span>Ajouter un résident</span>
          </button>
        </div>
      </div>

      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon">
            <FiUsers />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalResidents}</span>
            <span className="stat-label">Total Résidents</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FiHome />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.proprietaires}</span>
            <span className="stat-label">Propriétaires</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FiCalendar />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.locataires}</span>
            <span className="stat-label">Locataires</span>
          </div>
        </div>
      </div>

      <div className="residents-controls" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div className="search-container" style={{ flex: 1 }}>
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher un résident..."
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
              <button className="filter-pop-btn" style={{ textAlign: 'left', background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: filterStatus === 'all' ? '#2563eb' : '#1e293b', fontWeight: filterStatus === 'all' ? 600 : 400 }} onClick={() => { setFilterStatus('all'); setShowFilters(false); }}>Tous</button>
              <button className="filter-pop-btn" style={{ textAlign: 'left', background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: filterStatus === 'proprietaire' ? '#2563eb' : '#1e293b', fontWeight: filterStatus === 'proprietaire' ? 600 : 400 }} onClick={() => { setFilterStatus('proprietaire'); setShowFilters(false); }}>Propriétaires</button>
              <button className="filter-pop-btn" style={{ textAlign: 'left', background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: filterStatus === 'locataire' ? '#2563eb' : '#1e293b', fontWeight: filterStatus === 'locataire' ? 600 : 400 }} onClick={() => { setFilterStatus('locataire'); setShowFilters(false); }}>Locataires</button>
            </div>
          </div>
        )}
      </div>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      {isAddingResident && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{isEditing ? 'Modifier le Résident' : 'Ajouter un Nouveau Résident'}</h2>
            <form onSubmit={handleSubmitNewResident} className="resident-form">
              <div className="form-group">
                <label>Nom</label>
                <input
                  type="text"
                  name="name"
                  value={newResident.name}
                  onChange={handleNewResidentChange}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={newResident.email}
                  onChange={handleNewResidentChange}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Appartement</label>
                <select
                  name="apartment"
                  value={newResident.apartment}
                  onChange={handleNewResidentChange}
                  required
                  disabled={loading}
                >
                  <option value="">Sélectionner un appartement</option>
                  {availableApartments.map(apt => (
                    <option key={apt} value={apt}>{apt}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Téléphone</label>
                <input
                  type="tel"
                  name="phone"
                  value={newResident.phone}
                  onChange={handleNewResidentChange}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Statut</label>
                <select
                  name="status"
                  value={newResident.status}
                  onChange={handleNewResidentChange}
                  required
                  disabled={loading}
                >
                  <option value="proprietaire">Propriétaire</option>
                  <option value="locataire">Locataire</option>
                </select>
              </div>
              <div className="form-group">
                <label>Date d'entrée</label>
                <input
                  type="date"
                  name="entryDate"
                  value={newResident.entryDate}
                  onChange={handleNewResidentChange}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Paiement</label>
                <select
                  name="payment"
                  value={newResident.payment}
                  onChange={handleNewResidentChange}
                  required
                  disabled={loading}
                >
                  <option value="paye">Payé</option>
                  <option value="attente">En attente</option>
                  <option value="retard">En retard</option>
                </select>
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
      ) : filteredResidents.length === 0 ? (
        <div className="residents-table-container">
          <table className="residents-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Appartement</th>
                <th>Statut</th>
                <th>Date d'entrée</th>
                <th>Factures</th>
                <th>Actions</th>
              </tr>
            </thead>
          </table>
        </div>
      ) : (
        <div className="residents-table-container">
          <table className="residents-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Appartement</th>
                <th>Statut</th>
                <th>Date d'entrée</th>
                <th>Factures</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredResidents.map(resident => (
                <tr key={resident.id}>
                  <td>
                    <div className="resident-info">
                      <span className="resident-name">{resident.name}</span>
                      <span className="resident-email">{resident.email}</span>
                    </div>
                  </td>
                  <td>{resident.apartment}</td>
                  <td>
                    <span
                      className="status-badge"
                      style={{
                        backgroundColor: STATUS_LABELS[resident.status]?.color || '#f1f5f9',
                        color: STATUS_LABELS[resident.status]?.textColor || '#64748b',
                        fontWeight: 600
                      }}
                    >
                      {STATUS_LABELS[resident.status]?.label || 'Inconnu'}
                    </span>
                  </td>
                  <td>{resident.entryDate ? new Date(resident.entryDate).toLocaleDateString() : '-'}</td>
                  <td>
                    <button 
                      className="invoice-btn"
                      onClick={() => handleShowInvoices(resident)}
                      disabled={loading}
                    >
                      <FiFileText />
                      <span>Voir impayés</span>
                    </button>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="action-btn view"
                        onClick={() => handleEditResident(resident)}
                        disabled={loading}
                        title="Voir"
                      >
                        <FiEye />
                      </button>
                      <button 
                        className="action-btn delete"
                        onClick={() => handleDeleteResident(resident)}
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
      )}

      {showInvoiceModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Factures impayées de {selectedResident?.name}</h3>
            {loadingInvoices ? (
              <div className="loading">Chargement...</div>
            ) : (
              <div className="invoice-list">
                {residentInvoices.length === 0 ? (
                  <p className="no-invoices">Aucune facture impayée</p>
                ) : (
                  residentInvoices.map(inv => (
                    <div key={inv._id || inv.id} className="invoice-item">
                      <span className="invoice-description">{inv.description || 'Facture'}</span>
                      <span className="invoice-date">{new Date(inv.dueDate).toLocaleDateString()}</span>
                      <span className="invoice-amount">{inv.amount} €</span>
                    </div>
                  ))
                )}
              </div>
            )}
            <button className="close-btn" onClick={() => setShowInvoiceModal(false)}>
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Residents; 