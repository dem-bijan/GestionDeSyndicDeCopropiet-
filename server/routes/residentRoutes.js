const express = require('express');
const {
  getResidents,
  getResident,
  createResident,
  updateResident,
  deleteResident,
  residentLogin
} = require('../controllers/residentController.js');
const { verifyToken } = require('../middleware/auth.js');
const { compare, hash } = require('bcryptjs');
const Resident = require('../models/Resident.js');
const { changePasswordSchema } = require('../validators/resident');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Login route
router.post('/login', residentLogin);

// Get all residents
router.get('/', getResidents);

// Get current resident info (corrigé)
router.get('/me', verifyToken, async (req, res) => {
  try {
    const residentId = req.user.id;
    console.log('User ID for /me:', residentId);
    
    if (!residentId) {
      return res.status(401).json({ message: 'Token invalide ou expiré' });
    }

    const resident = await Resident.findById(residentId).select('-password');
    if (!resident) {
      return res.status(404).json({ message: 'Résident non trouvé' });
    }

    res.json({
      id: resident._id,
      name: resident.name,
      email: resident.email,
      phone: resident.phone,
      apartment: resident.apartment,
      status: resident.status
    });
  } catch (error) {
    console.error('Error in /me route:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du profil' });
  }
});

// Get single resident
router.get('/:id', getResident);

// Create resident
router.post('/', createResident);

// Update resident
router.put('/:id', updateResident);

// Delete resident
router.delete('/:id', deleteResident);

// Rate limiter for password change
const passwordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: { success: false, message: 'Too many password change attempts, try again later.' }
});

// Route pour changer le mot de passe (no restrictions)
router.post('/change-password', verifyToken, async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    const residentId = req.user.id || req.userId;
    if (!residentId) return res.status(401).json({ success: false, message: 'Token invalid or missing user ID' });
    const resident = await Resident.findById(residentId);
    if (!resident) return res.status(404).json({ success: false, message: 'Resident not found' });
    resident.password = await hash(newPassword, 10);
    await resident.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 