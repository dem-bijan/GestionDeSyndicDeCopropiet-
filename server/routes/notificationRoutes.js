const express = require('express');
const { verifyToken } = require('../middleware/auth.js');
const Notification = require('../models/Notification.js');

const router = express.Router();

// Récupérer les notifications d'un résident
router.get('/resident', verifyToken, async (req, res) => {
  try {
    const residentId = req.user.id;
    const notifications = await Notification.find({ recipient: residentId })
      .sort({ date: -1 })
      .populate('sender', 'firstName lastName')
      .populate('recipient', 'firstName lastName');

    res.json(notifications);
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des notifications' });
  }
});

// Marquer une notification comme lue
router.patch('/:id/read', verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification non trouvée' });
    }

    if (notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    notification.read = true;
    await notification.save();

    res.json(notification);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la notification:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la notification' });
  }
});

module.exports = router; 