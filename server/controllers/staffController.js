const Staff = require('../models/Staff.js');

// Get all staff
const getStaff = async (req, res) => {
  try {
    const staff = await Staff.find().sort({ createdAt: -1 });
    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single staff member
const getStaffMember = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: 'Membre du personnel non trouvé' });
    }
    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create staff member
const createStaff = async (req, res) => {
  try {
    const staff = new Staff(req.body);
    const savedStaff = await staff.save();
    res.status(201).json(savedStaff);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update staff member
const updateStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!staff) {
      return res.status(404).json({ message: 'Membre du personnel non trouvé' });
    }
    res.status(200).json(staff);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete staff member
const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: 'Membre du personnel non trouvé' });
    }
    res.status(200).json({ message: 'Membre du personnel supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStaff,
  getStaffMember,
  createStaff,
  updateStaff,
  deleteStaff
}; 