import React, { useState, useEffect } from 'react';
import { FiUser, FiFileText, FiBell, FiHome, FiMessageCircle, FiCalendar, FiHelpCircle, FiEdit2, FiCheckCircle, FiAlertCircle, FiXCircle, FiLock, FiTrash2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import './ResidentSpace.css';

const ResidentSpace = () => {
  const [profile, setProfile] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [messages, setMessages] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showSendMessage, setShowSendMessage] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [passwordMsg, setPasswordMsg] = useState('');
  const [messageForm, setMessageForm] = useState({ subject: '', body: '' });
  const [messageMsg, setMessageMsg] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingInvoiceId, setDeletingInvoiceId] = useState(null);
  const navigate = useNavigate();

  // Fetch all resident data
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      if (!token || !user || user.role !== 'resident') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/resident-login');
        return;
      }
      try {
        // Profile
        const profileRes = await fetch('http://localhost:6001/api/residents/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!profileRes.ok) throw new Error('Erreur profil');
        const profileData = await profileRes.json();
        setProfile(profileData);
        // Invoices
        const invoicesRes = await fetch(`http://localhost:6001/api/invoices/resident/${user.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setInvoices(invoicesRes.ok ? await invoicesRes.json() : []);
        // Messages
        const messagesRes = await fetch('http://localhost:6001/api/messages/resident', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setMessages(messagesRes.ok ? await messagesRes.json() : []);
        // Events/Meetings
        const eventsRes = await fetch('http://localhost:6001/api/meetings', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setEvents(eventsRes.ok ? await eventsRes.json() : []);
      } catch (err) {
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/resident-login');
  };

  // Change password handler
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:6001/api/residents/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(passwordForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur');
      setPasswordMsg('Mot de passe changé avec succès!');
      setPasswordForm({ currentPassword: '', newPassword: '' });
      setShowChangePassword(false);
    } catch (err) {
      setPasswordMsg(err.message);
    }
  };

  // Send message handler
  const handleSendMessage = async (e) => {
    e.preventDefault();
    setMessageMsg('');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:6001/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(messageForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur');
      setMessageMsg('Message envoyé!');
      setMessageForm({ subject: '', body: '' });
      setShowSendMessage(false);
    } catch (err) {
      setMessageMsg(err.message);
    }
  };

  const handleDeleteInvoice = async (invoiceId) => {
    if (!window.confirm('Supprimer cette facture ?')) return;
    setDeletingInvoiceId(invoiceId);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:6001/api/invoices/${invoiceId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Erreur lors de la suppression');
      setInvoices(invoices => invoices.filter(inv => inv._id !== invoiceId));
    } catch (err) {
      alert('Erreur lors de la suppression');
    } finally {
      setDeletingInvoiceId(null);
    }
  };

  if (loading) return <div className="loading">Chargement...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!profile) return <div className="error">Profil non trouvé</div>;

  // Helper for status color
  const statusTag = (status) => {
    if (status === 'paid' || status === 'Payé') return <span className="tag tag-green"><FiCheckCircle /> Payé</span>;
    if (status === 'unpaid' || status === 'En attente') return <span className="tag tag-yellow"><FiAlertCircle /> En attente</span>;
    if (status === 'overdue' || status === 'En retard') return <span className="tag tag-red"><FiXCircle /> En retard</span>;
    return <span className="tag">{status}</span>;
  };

  return (
    <div className="resident-dashboard">
      {/* Greeting */}
      <div className="dashboard-header">
        <h1>👋 Hello {profile.name}, welcome back!</h1>
        <button className="logout-btn" onClick={handleLogout}>Se déconnecter</button>
      </div>
      <div className="dashboard-grid">
        {/* Profile */}
        <div className="dashboard-card profile-card">
          <div className="card-header"><FiUser /> My Profile</div>
          <div className="card-content profile-content">
            <div><strong>Name:</strong> {profile.name}</div>
            <div><strong>Email:</strong> {profile.email}</div>
            <div><strong>Apartment:</strong> {profile.apartment}</div>
            <div><strong>Phone:</strong> {profile.phone}</div>
            <div><strong>Status:</strong> {profile.status}</div>
            <button className="edit-btn" onClick={() => setShowChangePassword(v => !v)}><FiLock /> Change Password</button>
            {showChangePassword && (
              <form className="change-password-form" onSubmit={handlePasswordChange}>
                <input type="password" placeholder="Current password" value={passwordForm.currentPassword} onChange={e => setPasswordForm(f => ({ ...f, currentPassword: e.target.value }))} required />
                <input type="password" placeholder="New password" value={passwordForm.newPassword} onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))} required />
                <button className="edit-btn" type="submit">Save</button>
                {passwordMsg && <div className="form-msg">{passwordMsg}</div>}
              </form>
            )}
        </div>
        </div>
        {/* Invoices */}
        <div className="dashboard-card invoices-card">
          <div className="card-header"><FiFileText /> My Invoices</div>
          <div className="card-content">
            {invoices.length === 0 ? <div>No invoices found.</div> : (
              <div className="invoice-list">
                {invoices.map(inv => (
                  <div key={inv._id} className={`invoice-item${inv.status === 'unpaid' || inv.status === 'En attente' ? ' invoice-unpaid' : ''}`}>
                    <div className="invoice-main">
                      <div className="invoice-ref"><strong>Reference:</strong> {inv.reference || inv.title || inv._id}</div>
                      <div className="invoice-date"><strong>Date:</strong> {inv.date ? new Date(inv.date).toLocaleDateString() : (inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '-')}</div>
                      <div className="invoice-amount"><strong>Amount:</strong> {inv.amount} DH</div>
              </div>
                    <div className="invoice-actions">
                      <button className="delete-btn" title="Supprimer" onClick={() => handleDeleteInvoice(inv._id)} disabled={deletingInvoiceId === inv._id}>
                        <FiTrash2 />
                      </button>
              </div>
            </div>
                ))}
              </div>
            )}
              </div>
            </div>
        {/* Messages */}
        <div className="dashboard-card messages-card">
          <div className="card-header"><FiMessageCircle /> Messages from Syndic</div>
          <div className="card-content">
            {messages.length === 0 ? <div>No messages.</div> : (
              <ul className="message-list">
                {messages.map(msg => (
                  <li key={msg._id} className="message-item">
                    <div className="message-title" onClick={() => { setSelectedMessage(msg); setShowMessageModal(true); }} style={{ cursor: 'pointer' }}>{msg.subject || msg.title}</div>
                    <button className="delete-btn" onClick={async () => {
                      setDeleting(true);
                      const token = localStorage.getItem('token');
                      await fetch(`http://localhost:6001/api/messages/${msg._id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
                      setMessages(messages.filter(m => m._id !== msg._id));
                      setDeleting(false);
                    }}>Supprimer</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        {/* Events/Meetings */}
        <div className="dashboard-card events-card">
          <div className="card-header"><FiCalendar /> What's Coming?</div>
          <div className="card-content">
            {events.length === 0 ? <div>No upcoming events.</div> : (
              <ul className="event-list">
                {events.map(ev => (
                  <li key={ev._id}>
                    <span className="event-title">{ev.title}</span> — <span className="event-date">{ev.date ? new Date(ev.date).toLocaleDateString() : '-'}</span>
                  </li>
                ))}
              </ul>
            )}
            </div>
              </div>
        {/* Support/Contact */}
        <div className="dashboard-card support-card">
          <div className="card-header"><FiHelpCircle /> Need help?</div>
          <div className="card-content">
            <div>Contact the syndic if you have a question or issue.</div>
            <button className="edit-btn" onClick={() => setShowSendMessage(v => !v)}>Send a message</button>
            {showSendMessage && (
              <form className="send-message-form" onSubmit={handleSendMessage}>
                <input type="text" placeholder="Subject" value={messageForm.subject} onChange={e => setMessageForm(f => ({ ...f, subject: e.target.value }))} required />
                <textarea placeholder="Your message" value={messageForm.body} onChange={e => setMessageForm(f => ({ ...f, body: e.target.value }))} required rows={3} />
                <button className="edit-btn" type="submit">Send</button>
                {messageMsg && <div className="form-msg">{messageMsg}</div>}
            </form>
          )}
        </div>
      </div>
      </div>
      {showMessageModal && selectedMessage && (
        <div className="modal-overlay" onClick={() => setShowMessageModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>{selectedMessage.subject}</h3>
            <p>{selectedMessage.content}</p>
            <button onClick={() => setShowMessageModal(false)}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResidentSpace; 