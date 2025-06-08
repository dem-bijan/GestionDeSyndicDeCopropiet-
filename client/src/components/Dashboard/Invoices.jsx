import React, { useState, useEffect } from 'react';
import { FiFileText, FiSearch, FiFilter, FiPlus, FiDownload, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import './Invoices.css';

const mockOverview = {
  totalIncome: 12500,
  totalExpenses: 8300,
  unpaidInvoices: 3,
  lastUpdate: '2024-06-10',
};

const mockInvoices = [
  { id: 1, number: 'INV-2024-001', date: '2024-06-01', amount: 1200, status: 'paid' },
  { id: 2, number: 'INV-2024-002', date: '2024-06-03', amount: 800, status: 'paid' },
  { id: 3, number: 'INV-2024-003', date: '2024-06-05', amount: 1200, status: 'unpaid' },
  { id: 4, number: 'INV-2024-004', date: '2024-06-07', amount: 500, status: 'late' },
  { id: 5, number: 'INV-2024-005', date: '2024-06-10', amount: 300, status: 'paid' },
  { id: 6, number: 'INV-2024-006', date: '2024-06-12', amount: 1200, status: 'unpaid' },
];

const STATUS_LABELS = {
  paid: { label: 'Payée', color: '#e6f9ed', textColor: '#16a34a' },
  unpaid: { label: 'En attente', color: '#fffbe6', textColor: '#d97706' },
  late: { label: 'En retard', color: '#fee2e2', textColor: '#dc2626' },
};

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const Invoices = () => {
  const [overview, setOverview] = useState({ totalIncome: 0, totalExpenses: 0, unpaidInvoices: 0, lastUpdate: new Date().toLocaleDateString() });
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterMonth, setFilterMonth] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const isAdmin = true; // À remplacer par le vrai rôle utilisateur
  const [showAddInvoiceModal, setShowAddInvoiceModal] = useState(false);
  const [newInvoice, setNewInvoice] = useState({ type: 'cotisation', amount: 0, description: '', dueDate: '', resident: '' });
  const [residents, setResidents] = useState([]);

  // Fetch invoices from API
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await fetch('http://localhost:6001/api/invoices');
        if (!res.ok) throw new Error('Erreur lors du chargement des factures');
        const data = await res.json();
        setInvoices(data);
        // Calculate total revenue: cotisation - repair
        const totalCotisation = data.filter(inv => inv.type === 'cotisation').reduce((sum, inv) => sum + inv.amount, 0);
        const totalRepair = data.filter(inv => inv.type === 'repair').reduce((sum, inv) => sum + inv.amount, 0);
        setOverview(prev => ({ ...prev, totalIncome: totalCotisation - totalRepair, totalExpenses: totalRepair }));
      } catch (err) {
        console.error(err);
      }
    };
    fetchInvoices();
  }, []);

  // Fetch residents for tax invoices
  useEffect(() => {
    const fetchResidents = async () => {
      try {
        const res = await fetch('http://localhost:6001/api/residents');
        if (!res.ok) throw new Error('Erreur lors du chargement des résidents');
        const data = await res.json();
        setResidents(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchResidents();
  }, []);

  const handleAddInvoice = () => {
    setShowAddInvoiceModal(true);
  };

  const handleNewInvoiceChange = (e) => {
    const { name, value } = e.target;
    setNewInvoice(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitNewInvoice = async (e) => {
    e.preventDefault();
    try {
      if (newInvoice.type === 'cotisation') {
        // Send cotisation to all residents
        const res = await fetch('http://localhost:6001/api/invoices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...newInvoice, residents: 'all' })
        });
        if (!res.ok) throw new Error('Erreur lors de l\'ajout de la cotisation');
      } else if (newInvoice.type === 'tax') {
        // Send tax to specific resident
        const res = await fetch('http://localhost:6001/api/invoices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newInvoice)
        });
        if (!res.ok) throw new Error('Erreur lors de l\'ajout de la taxe');
      } else if (newInvoice.type === 'repair') {
        // Add repair invoice
        const res = await fetch('http://localhost:6001/api/invoices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newInvoice)
        });
        if (!res.ok) throw new Error('Erreur lors de l\'ajout de la réparation');
      }
      setShowAddInvoiceModal(false);
      setNewInvoice({ type: 'cotisation', amount: 0, description: '', dueDate: '', resident: '' });
      // Refresh invoices
      const res = await fetch('http://localhost:6001/api/invoices');
      const data = await res.json();
      setInvoices(data);
      // Update overview
      const totalCotisation = data.filter(inv => inv.type === 'cotisation').reduce((sum, inv) => sum + inv.amount, 0);
      const totalRepair = data.filter(inv => inv.type === 'repair').reduce((sum, inv) => sum + inv.amount, 0);
      setOverview(prev => ({ ...prev, totalIncome: totalCotisation - totalRepair, totalExpenses: totalRepair }));
    } catch (err) {
      console.error(err);
    }
  };

  // Générer la liste des années présentes dans les factures
  const years = Array.from(new Set(invoices.map(inv => new Date(inv.dueDate).getFullYear())));

  // Filtres et recherche
  let filtered = invoices.filter(inv => {
    const matchesSearch =
      inv.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.amount.toString().includes(searchTerm) ||
      (STATUS_LABELS[inv.status]?.label.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesMonth = filterMonth === 'all' || (new Date(inv.dueDate).getMonth() === parseInt(filterMonth));
    const matchesYear = filterYear === 'all' || (new Date(inv.dueDate).getFullYear() === parseInt(filterYear));
    const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;
    return matchesSearch && matchesMonth && matchesYear && matchesStatus;
  });

  // Tri
  filtered = filtered.sort((a, b) => {
    if (sortBy === 'date') {
      return sortDir === 'asc'
        ? new Date(a.dueDate) - new Date(b.dueDate)
        : new Date(b.dueDate) - new Date(a.dueDate);
    }
    if (sortBy === 'amount') {
      return sortDir === 'asc' ? a.amount - b.amount : b.amount - a.amount;
    }
    if (sortBy === 'status') {
      return sortDir === 'asc'
        ? (a.status || '').localeCompare(b.status || '')
        : (b.status || '').localeCompare(a.status || '');
    }
    return 0;
  });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
  };

  return (
    <div className="dashboard-main-content">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', borderBottom: '1px solid #e2e8f0', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <FiFileText size={24} style={{ color: '#2563eb' }} />
          <span style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1e293b', letterSpacing: '0.025em' }}>
            Gestion des Factures
          </span>
        </div>
        {isAdmin && (
          <button className="add-invoice-btn" style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.6em 1.5em', fontSize: '1.05em', fontWeight: 600, boxShadow: '0 2px 8px rgba(37,99,235,0.10)', cursor: 'pointer', transition: 'background 0.2s' }} onClick={handleAddInvoice} onMouseOver={e => e.currentTarget.style.background='#1e40af'} onMouseOut={e => e.currentTarget.style.background='#2563eb'}>
            <FiPlus style={{ marginRight: 8 }} /> Nouvelle facture
          </button>
        )}
      </div>
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <span className="stat-value">{overview.totalIncome.toLocaleString()} €</span>
            <span className="stat-label">Total revenus</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💸</div>
          <div className="stat-info">
            <span className="stat-value">{overview.totalExpenses.toLocaleString()} €</span>
            <span className="stat-label">Total dépenses</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <span className="stat-value">{overview.unpaidInvoices}</span>
            <span className="stat-label">Factures impayées</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🕒</div>
          <div className="stat-info">
            <span className="stat-value">{overview.lastUpdate}</span>
            <span className="stat-label">Dernière mise à jour</span>
          </div>
        </div>
      </div>
      <div className="invoices-controls" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', margin: '2rem 0 1.5rem 0', flexWrap: 'wrap', position: 'relative' }}>
        <div className="search-container" style={{ flex: 1 }}>
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher une facture, un montant, un statut..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <button className="filter-btn" type="button" onClick={() => setShowFilters(v => !v)} aria-label="Filtrer">
          <FiFilter style={{ marginRight: 6 }} />
          Filtrer
        </button>
        {showFilters && (
          <div className="filters-popover" style={{ position: 'absolute', top: 60, right: 0, zIndex: 10, background: 'white', borderRadius: '0.75rem', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', padding: '1rem', minWidth: 220 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Mois</div>
            <select className="filter-select" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
              <option value="all">Tous</option>
              {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
            <div style={{ fontWeight: 600, margin: '12px 0 8px 0' }}>Année</div>
            <select className="filter-select" value={filterYear} onChange={e => setFilterYear(e.target.value)}>
              <option value="all">Toutes</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <div style={{ fontWeight: 600, margin: '12px 0 8px 0' }}>Statut</div>
            <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="all">Tous</option>
              <option value="paid">Payée</option>
              <option value="unpaid">En attente</option>
              <option value="late">En retard</option>
            </select>
          </div>
        )}
      </div>
      <div className="invoices-table-container" style={{ marginTop: '1.5rem', background: '#fff', borderRadius: '16px', boxShadow: '0 2px 12px rgba(37,99,235,0.07)', padding: '1.5rem 1.2rem 1.2rem 1.2rem' }}>
        <table className="invoices-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5em', fontSize: '1rem' }}>
          <thead>
            <tr>
              <th style={{ background: '#f0f9ff', color: '#2563eb', fontWeight: 700, borderRadius: '12px 12px 0 0', fontSize: '1.08em', padding: '0.85em 1.1em', textAlign: 'left' }}>Numéro</th>
              <th style={{ background: '#f0f9ff', color: '#2563eb', fontWeight: 700, borderRadius: '12px 12px 0 0', fontSize: '1.08em', padding: '0.85em 1.1em', textAlign: 'left' }}>Date</th>
              <th style={{ background: '#f0f9ff', color: '#2563eb', fontWeight: 700, borderRadius: '12px 12px 0 0', fontSize: '1.08em', padding: '0.85em 1.1em', textAlign: 'left' }}>Montant</th>
              <th style={{ background: '#f0f9ff', color: '#2563eb', fontWeight: 700, borderRadius: '12px 12px 0 0', fontSize: '1.08em', padding: '0.85em 1.1em', textAlign: 'left' }}>Statut</th>
              <th style={{ background: '#f0f9ff', color: '#2563eb', fontWeight: 700, borderRadius: '12px 12px 0 0', fontSize: '1.08em', padding: '0.85em 1.1em', textAlign: 'left' }}>Résident</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: '#64748b', height: 48 }}>Aucune facture</td></tr>
            ) : (
              filtered.map(inv => (
                <tr key={inv._id} style={{ background: '#fff', boxShadow: '0 2px 10px rgba(37,99,235,0.09)', borderRadius: '16px', transition: 'box-shadow 0.2s' }}>
                  <td style={{ fontWeight: 600, color: '#1e293b', padding: '0.85em 1.1em', borderTop: 'none', borderBottom: '1px solid #f1f5f9' }}>{inv.description || 'Facture'}</td>
                  <td style={{ padding: '0.85em 1.1em', borderTop: 'none', borderBottom: '1px solid #f1f5f9' }}>{new Date(inv.dueDate).toLocaleDateString()}</td>
                  <td style={{ padding: '0.85em 1.1em', borderTop: 'none', borderBottom: '1px solid #f1f5f9', color: '#059669', fontWeight: 600 }}>{inv.amount} €</td>
                  <td style={{ padding: '0.85em 1.1em', borderTop: 'none', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{
                      background: STATUS_LABELS[inv.status]?.color,
                      color: STATUS_LABELS[inv.status]?.textColor,
                      borderRadius: '8px',
                      padding: '0.25em 0.75em',
                      fontWeight: 500,
                      fontSize: '0.95em'
                    }}>{STATUS_LABELS[inv.status]?.label || inv.status}</span>
                  </td>
                  <td style={{ padding: '0.85em 1.1em', borderTop: 'none', borderBottom: '1px solid #f1f5f9' }}>{inv.resident?.name || 'N/A'} ({inv.resident?.apartment || 'N/A'})</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {showAddInvoiceModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Ajouter une nouvelle facture</h2>
            <form onSubmit={handleSubmitNewInvoice} className="invoice-form">
              <div className="form-group">
                <label>Type</label>
                <select name="type" value={newInvoice.type} onChange={handleNewInvoiceChange} required>
                  <option value="cotisation">Cotisation</option>
                  <option value="tax">Taxe</option>
                  <option value="repair">Réparation</option>
                </select>
              </div>
              <div className="form-group">
                <label>Montant</label>
                <input type="number" name="amount" value={newInvoice.amount} onChange={handleNewInvoiceChange} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input type="text" name="description" value={newInvoice.description} onChange={handleNewInvoiceChange} required />
              </div>
              <div className="form-group">
                <label>Date d'échéance</label>
                <input type="date" name="dueDate" value={newInvoice.dueDate} onChange={handleNewInvoiceChange} required />
              </div>
              {newInvoice.type === 'tax' && (
                <div className="form-group">
                  <label>Résident</label>
                  <select name="resident" value={newInvoice.resident} onChange={handleNewInvoiceChange} required>
                    <option value="">Sélectionner un résident</option>
                    {residents.map(r => (
                      <option key={r._id} value={r._id}>{r.name} ({r.apartment})</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="form-actions">
                <button type="submit" className="submit-btn">Ajouter</button>
                <button type="button" className="cancel-btn" onClick={() => setShowAddInvoiceModal(false)}>Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices; 