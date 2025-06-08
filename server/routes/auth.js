const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User.js');
const Resident = require('../models/Resident.js');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Route d'enregistrement
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Créer le nouvel utilisateur
    const user = new User({
      email,
      password, // sera hashé automatiquement par le middleware
      name,
      role: role || 'user'
    });

    await user.save();

    // Créer le token JWT
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET || 'super_secret_key',
      { expiresIn: '24h' }
    );

    // Envoyer la réponse
    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erreur register:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route de login unifiée
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for:', email);

    // 1. Vérifier si c'est un admin/user
    const user = await User.findOne({ email });
    if (user) {
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      }
      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'super_secret_key',
        { expiresIn: '24h' }
      );
      return res.json({
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    }

    // 2. Sinon, vérifier si c'est un résident
    const resident = await Resident.findOne({ email });
    if (!resident) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, resident.password || '');
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Générer le token
    const token = jwt.sign(
      { id: resident._id, email: resident.email, role: 'resident' },
      process.env.JWT_SECRET || 'super_secret_key',
      { expiresIn: '7d' }
    );

    // Retourner la réponse
    return res.json({
      token,
      user: {
        id: resident._id,
        email: resident.email,
        name: resident.name,
        role: 'resident',
        apartment: resident.apartment
      }
    });
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router; 