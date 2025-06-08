const GarageSpot = require('../models/GarageSpot.js');
const Resident = require('../models/Resident.js');

// Get all garage spots
const getGarageSpots = async (req, res) => {
  try {
    const spots = await GarageSpot.find()
      .populate('assignedTo', 'name email')
      .sort({ spotNumber: 1 });
    res.json(spots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single garage spot
const getGarageSpot = async (req, res) => {
  try {
    const spot = await GarageSpot.findById(req.params.id)
      .populate('assignedTo', 'name email');
    
    if (!spot) {
      return res.status(404).json({ message: 'Place de parking non trouvée' });
    }
    
    res.json(spot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new garage spot
const createGarageSpot = async (req, res) => {
  try {
    const spot = new GarageSpot(req.body);
    const newSpot = await spot.save();
    res.status(201).json(newSpot);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a garage spot
const updateGarageSpot = async (req, res) => {
  try {
    const spot = await GarageSpot.findById(req.params.id);
    
    if (!spot) {
      return res.status(404).json({ message: 'Place de parking non trouvée' });
    }
    
    Object.assign(spot, req.body);
    const updatedSpot = await spot.save();
    res.json(updatedSpot);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a garage spot
const deleteGarageSpot = async (req, res) => {
  try {
    const spot = await GarageSpot.findById(req.params.id);
    
    if (!spot) {
      return res.status(404).json({ message: 'Place de parking non trouvée' });
    }
    
    await spot.deleteOne();
    res.json({ message: 'Place de parking supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get spots by status
const getSpotsByStatus = async (req, res) => {
  try {
    const spots = await GarageSpot.find({ status: req.params.status })
      .populate('assignedTo', 'name email')
      .sort({ spotNumber: 1 });
    res.json(spots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get spots by type
const getSpotsByType = async (req, res) => {
  try {
    const spots = await GarageSpot.find({ type: req.params.type })
      .populate('assignedTo', 'name email')
      .sort({ spotNumber: 1 });
    res.json(spots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assign a spot to a resident
const assignSpot = async (req, res) => {
  try {
    const { residentId } = req.body;
    const spot = await GarageSpot.findById(req.params.id);
    
    if (!spot) {
      return res.status(404).json({ message: 'Place de parking non trouvée' });
    }
    
    const resident = await Resident.findById(residentId);
    if (!resident) {
      return res.status(404).json({ message: 'Résident non trouvé' });
    }
    
    spot.assignedTo = residentId;
    spot.status = 'occupied';
    spot.assignmentDate = new Date();
    
    const updatedSpot = await spot.save();
    res.json(updatedSpot);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update spot status
const updateSpotStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const spot = await GarageSpot.findById(req.params.id);
    
    if (!spot) {
      return res.status(404).json({ message: 'Place de parking non trouvée' });
    }
    
    spot.status = status;
    if (status === 'available') {
      spot.assignedTo = null;
      spot.assignmentDate = null;
    }
    
    const updatedSpot = await spot.save();
    res.json(updatedSpot);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get garage statistics
const getGarageStats = async (req, res) => {
  try {
    const totalSpots = await GarageSpot.countDocuments();
    const availableSpots = await GarageSpot.countDocuments({ status: 'available' });
    const occupiedSpots = await GarageSpot.countDocuments({ status: 'occupied' });
    const maintenanceSpots = await GarageSpot.countDocuments({ status: 'maintenance' });
    
    const stats = {
      total: totalSpots,
      available: availableSpots,
      occupied: occupiedSpots,
      maintenance: maintenanceSpots
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
}; 