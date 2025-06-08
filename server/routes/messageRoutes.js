const express = require('express');
const { verifyToken } = require('../middleware/auth.js');
const Message = require('../models/Message.js');

const router = express.Router();

// Récupérer les messages d'un résident
router.get('/resident', verifyToken, async (req, res) => {
  try {
    const residentId = req.user.id;
    console.log('[DEBUG] Fetching messages for residentId:', residentId);
    const messages = await Message.find({ recipient: residentId })
      .sort({ date: -1 })
      .populate('sender', 'firstName lastName')
      .populate('recipient', 'firstName lastName');
    console.log('[DEBUG] Found messages:', messages.length);
    res.json(messages);
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des messages' });
  }
});

// Marquer un message comme lu
router.patch('/:id/read', verifyToken, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }

    if (message.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    message.read = true;
    await message.save();

    res.json(message);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du message:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du message' });
  }
});

// POST /api/messages - Resident sends a message to admin
router.post('/', verifyToken, async (req, res) => {
  try {
    const { subject, body, recipients } = req.body;
    if (!subject || !body) {
      return res.status(400).json({ message: 'Subject and message body are required.' });
    }
    const sender = req.user.email;
    const senderName = req.user.name || '';
    console.log('[DEBUG] Message POST sender:', sender, 'role:', req.user.role, 'recipients:', recipients);
    // If admin is sending
    if (req.user.role === 'admin') {
      const Resident = require('../models/Resident.js');
      let recipientIds = [];
      if (recipients === 'all') {
        const allResidents = await Resident.find({}, '_id');
        recipientIds = allResidents.map(r => r._id.toString());
      } else if (Array.isArray(recipients)) {
        recipientIds = recipients;
      }
      if (recipientIds.length === 0) {
        return res.status(400).json({ message: 'No recipients specified.' });
      }
      // Create a message for each resident
      const messages = await Promise.all(recipientIds.map(async (rid) => {
        const msg = new Message({
          sender: senderName ? `${senderName} <${sender}>` : sender,
          recipient: rid,
          subject,
          content: body,
          date: new Date(),
          read: false
        });
        return msg.save();
      }));
      console.log('[DEBUG] Created messages for residents:', messages.map(m => m.recipient));
      return res.status(201).json({ message: 'Messages envoyés aux résidents.', count: messages.length });
    }
    // If resident is sending
    const message = new Message({
      sender: senderName ? `${senderName} <${sender}>` : sender,
      recipient: 'admin',
      subject,
      content: body,
      date: new Date(),
      read: false
    });
    await message.save();
    console.log('[DEBUG] Resident message sent to admin:', message);
    res.status(201).json({ message: 'Message envoyé au syndic.' });
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error);
    res.status(500).json({ message: 'Erreur lors de l\'envoi du message.' });
  }
});

// GET /api/messages/admin - List all messages sent to admin
router.get('/admin', verifyToken, async (req, res) => {
  try {
    // Only allow admin users
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès refusé' });
    }
    const messages = await Message.find({ recipient: 'admin' }).sort({ date: -1 });
    res.json(messages);
  } catch (error) {
    console.error('Erreur lors de la récupération des messages admin:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des messages admin' });
  }
});

// DELETE /api/messages/:id - Delete a message by ID
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message non trouvé' });
    // Only recipient, sender, or admin can delete
    if (
      req.user.role !== 'admin' &&
      message.recipient !== req.user.id &&
      message.recipient !== req.user.email &&
      message.sender !== req.user.email
    ) {
      return res.status(403).json({ message: 'Non autorisé' });
    }
    await message.deleteOne();
    res.json({ message: 'Message supprimé' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression du message' });
  }
});

module.exports = router; 