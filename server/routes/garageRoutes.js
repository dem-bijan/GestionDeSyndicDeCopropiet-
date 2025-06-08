const express = require('express');
const {
  getGarageSpots,
  getGarageSpot,
  createGarageSpot,
  updateGarageSpot,
  deleteGarageSpot,
  getSpotsByStatus,
  getSpotsByType,
  assignSpot,
  updateSpotStatus,
  getGarageStats
} = require('../controllers/garageController.js');

const router = express.Router();

// Get all garage spots
router.get('/', getGarageSpots);

// Get garage statistics
router.get('/stats', getGarageStats);

// Get spots by status
router.get('/status/:status', getSpotsByStatus);

// Get spots by type
router.get('/type/:type', getSpotsByType);

// Get a single garage spot
router.get('/:id', getGarageSpot);

// Create a new garage spot
router.post('/', createGarageSpot);

// Update a garage spot
router.put('/:id', updateGarageSpot);

// Update spot status
router.patch('/:id/status', updateSpotStatus);

// Assign spot to resident
router.patch('/:id/assign', assignSpot);

// Delete a garage spot
router.delete('/:id', deleteGarageSpot);

module.exports = router; 