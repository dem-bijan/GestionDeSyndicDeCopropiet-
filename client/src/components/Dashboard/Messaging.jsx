import React, { useState, useEffect } from 'react';
import { FiMail, FiSend, FiUsers, FiUser } from 'react-icons/fi';
import './Messaging.css';

const Messaging = () => {
  const [messages, setMessages] = useState([]);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [recipients, setRecipients] = useState('all');
  const [selectedResidents, setSelectedResidents] = useState([]);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState('');
  const [residentList, setResidentList] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch all messages sent to admin
  useEffect(() => {
    const fetchMessages = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('http://localhost:6001/api/messages/admin', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Erreur lors du chargement des messages');
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        setMessages([]);
      }
    };
    fetchMessages();
  }, []);

  // Fetch resident list for custom recipients
  useEffect(() => {
    const fetchResidents = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('http://localhost:6001/api/residents', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Erreur lors du chargement des résidents');
        const data = await res.json();
        setResidentList(data);
      } catch (err) {
        setResidentList([]);
      }
    };
    fetchResidents();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    setSuccess('');
    const token = localStorage.getItem('token');
    try {
      let recipientsData = recipients === 'all' ? 'all' : selectedResidents;
      const res = await fetch('http://localhost:6001/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ subject, body: content, recipients: recipientsData })
      });
      if (!res.ok) throw new Error('Erreur lors de l\'envoi du message');
      setSubject('');
      setContent('');
      setRecipients('all');
      setSelectedResidents([]);
      setSuccess('Message envoyé !');
      setTimeout(() => setSuccess(''), 2000);
      // Refresh messages
      const msgRes = await fetch('http://localhost:6001/api/messages/admin', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMessages(msgRes.ok ? await msgRes.json() : []);
    } catch (err) {
      setSuccess('Erreur lors de l\'envoi du message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="messaging-page">
      <div className="messaging-header">
        <FiMail size={24} style={{ color: '#2563eb' }} />
        <h1>Messagerie du Syndic</h1>
      </div>
      <div className="messaging-content">
        <div className="messaging-form-container">
          <h2>Envoyer un message</h2>
          <form className="messaging-form" onSubmit={handleSend}>
            <div className="form-group">
              <label>Sujet</label>
              <input type="text" value={subject} onChange={e => setSubject(e.target.value)} required disabled={sending} />
            </div>
            <div className="form-group">
              <label>Contenu</label>
              <textarea value={content} onChange={e => setContent(e.target.value)} rows={3} required disabled={sending} />
            </div>
            <div className="form-group">
              <label>Destinataires</label>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <input type="radio" name="recipients" value="all" checked={recipients === 'all'} onChange={() => setRecipients('all')} disabled={sending} />
                  <FiUsers /> Tous les résidents
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <input type="radio" name="recipients" value="custom" checked={recipients === 'custom'} onChange={() => setRecipients('custom')} disabled={sending} />
                  <FiUser /> Par lot
                </label>
              </div>
              {recipients === 'custom' && (
                <div className="residents-select-list">
                  {residentList.map(r => (
                    <label key={r._id} style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 12 }}>
                      <input
                        type="checkbox"
                        checked={selectedResidents.includes(r._id)}
                        onChange={e => {
                          if (e.target.checked) setSelectedResidents([...selectedResidents, r._id]);
                          else setSelectedResidents(selectedResidents.filter(x => x !== r._id));
                        }}
                        disabled={sending}
                      />
                      {r.name} ({r.apartment})
                    </label>
                  ))}
                </div>
              )}
            </div>
            <button className="send-btn" type="submit" disabled={sending || !subject || !content || (recipients === 'custom' && selectedResidents.length === 0)}>
              <FiSend /> Envoyer notification
            </button>
            {success && <div className="success-message">{success}</div>}
          </form>
        </div>
        <div className="messaging-table-container">
          <h2>Messages reçus</h2>
          <table className="messaging-table">
            <thead>
              <tr>
                <th>Sujet</th>
                <th>Aperçu</th>
                <th>Date</th>
                <th>Expéditeur</th>
              </tr>
            </thead>
            <tbody>
              {messages.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: '#64748b', height: 48 }}>Aucun message</td></tr>
              ) : (
                messages.map(msg => (
                  <tr key={msg._id}>
                    <td style={{ fontWeight: 600, color: '#1e293b', cursor: 'pointer' }} onClick={() => { setSelectedMessage(msg); setShowMessageModal(true); }}>{msg.subject}</td>
                    <td>{msg.content.slice(0, 40)}{msg.content.length > 40 ? '…' : ''}</td>
                    <td>{new Date(msg.date).toLocaleDateString()}</td>
                    <td>{msg.sender}
                      <button className="delete-btn" onClick={async () => {
                        setDeleting(true);
                        const token = localStorage.getItem('token');
                        await fetch(`http://localhost:6001/api/messages/${msg._id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
                        setMessages(messages.filter(m => m._id !== msg._id));
                        setDeleting(false);
                      }}>Supprimer</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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

export default Messaging; 