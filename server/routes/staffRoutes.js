const express = require('express');
const {
  getStaff,
  getStaffMember,
  createStaff,
  updateStaff,
  deleteStaff
} = require('../controllers/staffController.js');

const router = express.Router();

// Get all staff
router.get('/', getStaff);

// Get single staff member
router.get('/:id', getStaffMember);

// Create staff member
router.post('/', createStaff);

// Update staff member
router.put('/:id', updateStaff);

// Delete staff member
router.delete('/:id', deleteStaff);

module.exports = router; 