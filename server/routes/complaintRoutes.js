const express = require('express');
const { verifyToken } = require('../middleware/auth.js');
const Complaint = require('../models/Complaint.js');
const Notification = require('../models/Notification.js');
const Resident = require('../models/Resident.js');
const { complaintSchema } = require('../validators/resident');

const router = express.Router();

// Créer une réclamation (robuste + validation)
router.post('/', verifyToken, async (req, res, next) => {
  try {
    const { error } = complaintSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const { subject, description, priority } = req.body;
    const residentId = req.user.id || req.userId;
    if (!residentId) return res.status(401).json({ success: false, message: 'Token invalid or missing user ID' });

    const resident = await Resident.findById(residentId);
    if (!resident) return res.status(404).json({ success: false, message: 'Resident not found' });

    const complaint = new Complaint({
      resident: residentId,
      subject,
      description,
      priority: priority || 'MEDIUM'
    });

    await complaint.save();

    // Créer une notification pour l'admin
    const notification = new Notification({
      recipient: 'admin',
      title: 'Nouvelle réclamation',
      content: `Nouvelle réclamation de ${resident.name}: ${subject}`,
      type: 'COMPLAINT',
      relatedId: complaint._id
    });

    await notification.save();

    res.status(201).json({ success: true, complaint });
  } catch (error) {
    next(error);
  }
});

// Récupérer les réclamations d'un résident
router.get('/resident', verifyToken, async (req, res) => {
  try {
    const residentId = req.user.id;
    const complaints = await Complaint.find({ resident: residentId })
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    console.error('Erreur lors de la récupération des réclamations:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des réclamations' });
  }
});

// Récupérer une réclamation spécifique
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('resident', 'name email');

    if (!complaint) {
      return res.status(404).json({ message: 'Réclamation non trouvée' });
    }

    // Vérifier si l'utilisateur est autorisé à voir cette réclamation
    if (complaint.resident._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    res.json(complaint);
  } catch (error) {
    console.error('Erreur lors de la récupération de la réclamation:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de la réclamation' });
  }
});

module.exports = router; 