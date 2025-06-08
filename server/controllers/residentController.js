const Resident = require('../models/Resident.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Get all residents
const getResidents = async (req, res) => {
  try {
    const residents = await Resident.find().sort({ createdAt: -1 });
    res.status(200).json(residents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single resident
const getResident = async (req, res) => {
  try {
    const resident = await Resident.findById(req.params.id);
    if (!resident) {
      return res.status(404).json({ message: 'Résident non trouvé' });
    }
    res.status(200).json(resident);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create resident
const createResident = async (req, res) => {
  try {
    const { email, apartment } = req.body;
    // Check if email is already used
    const existingEmail = await Resident.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    // Check if apartment is already taken
    const existingApartment = await Resident.findOne({ apartment });
    if (existingApartment) {
      return res.status(400).json({ message: 'Apartment already taken' });
    }
    const resident = new Resident(req.body);
    const savedResident = await resident.save();
    res.status(201).json(savedResident);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update resident
const updateResident = async (req, res) => {
  try {
    const resident = await Resident.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!resident) {
      return res.status(404).json({ message: 'Résident non trouvé' });
    }
    res.status(200).json(resident);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete resident
const deleteResident = async (req, res) => {
  try {
    const resident = await Resident.findByIdAndDelete(req.params.id);
    if (!resident) {
      return res.status(404).json({ message: 'Résident non trouvé' });
    }
    res.status(200).json({ message: 'Résident supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Connexion résident (et première activation si pas de mot de passe)
const residentLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log('Resident login attempt for:', email);
    
    const resident = await Resident.findOne({ email });
    if (!resident) {
      console.log('No resident found with email:', email);
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Handle first login
    if (!resident.password) {
      console.log('First login for resident:', email);
      const hashedPassword = await bcrypt.hash(password, 10);
      resident.password = hashedPassword;
      await resident.save();
    } else {
      // Normal login
    const isMatch = await bcrypt.compare(password, resident.password);
    if (!isMatch) {
        console.log('Invalid password for resident:', email);
        return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      }
    }

    // Generate token
    const token = jwt.sign(
      { id: resident._id, email: resident.email, role: 'resident' },
      process.env.JWT_SECRET || 'super_secret_key',
      { expiresIn: '7d' }
    );

    // Return response
    const user = {
      id: resident._id,
      email: resident.email,
      name: resident.name,
      role: 'resident',
      apartment: resident.apartment,
      phone: resident.phone
    };

    console.log('Successful login for resident:', email);
    return res.status(200).json({ token, user });
  } catch (error) {
    console.error('Error in resident login:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = {
  getResidents,
  getResident,
  createResident,
  updateResident,
  deleteResident,
  residentLogin
}; 