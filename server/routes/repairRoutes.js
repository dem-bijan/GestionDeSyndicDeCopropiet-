const express = require('express');
const {
  getRepairs,
  getRepairsByStatus,
  getRepairsByPriority,
  getRepair,
  createRepair,
  updateRepair,
  updateRepairStatus,
  assignRepair,
  deleteRepair
} = require('../controllers/repairController.js');

const router = express.Router();

// Get all repairs
router.get('/', getRepairs);

// Get repairs by status
router.get('/status/:status', getRepairsByStatus);

// Get repairs by priority
router.get('/priority/:priority', getRepairsByPriority);

// Get a single repair
router.get('/:id', getRepair);

// Create a new repair
router.post('/', createRepair);

// Update a repair
router.put('/:id', updateRepair);

// Update repair status
router.patch('/:id/status', updateRepairStatus);

// Assign repair to staff member
router.patch('/:id/assign', assignRepair);

// Delete a repair
router.delete('/:id', deleteRepair);

module.exports = router; 