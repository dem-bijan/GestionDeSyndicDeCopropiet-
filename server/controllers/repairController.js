const Repair = require('../models/Repair.js');

// Get all repairs
const getRepairs = async (req, res) => {
  try {
    const repairs = await Repair.find()
      .populate('assignedStaff', 'name email')
      .sort({ createdAt: -1 });
    res.json(repairs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single repair
const getRepair = async (req, res) => {
  try {
    const repair = await Repair.findById(req.params.id)
      .populate('assignedStaff', 'name email');
    
    if (!repair) {
      return res.status(404).json({ message: 'Réparation non trouvée' });
    }
    
    res.json(repair);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new repair
const createRepair = async (req, res) => {
  const repair = new Repair({
    title: req.body.title,
    description: req.body.description,
    location: req.body.location,
    priority: req.body.priority,
    status: req.body.status || 'pending',
    assignedStaff: req.body.assignedStaff
  });

  try {
    const newRepair = await repair.save();
    await newRepair.populate('assignedStaff', 'name email');
    res.status(201).json(newRepair);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a repair
const updateRepair = async (req, res) => {
  try {
    const repair = await Repair.findById(req.params.id);
    
    if (!repair) {
      return res.status(404).json({ message: 'Réparation non trouvée' });
    }

    Object.assign(repair, req.body);
    repair.updatedAt = new Date();
    const updatedRepair = await repair.save();
    await updatedRepair.populate('assignedStaff', 'name email');
    
    res.json(updatedRepair);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a repair
const deleteRepair = async (req, res) => {
  try {
    const repair = await Repair.findById(req.params.id);
    
    if (!repair) {
      return res.status(404).json({ message: 'Réparation non trouvée' });
    }

    await repair.deleteOne();
    res.json({ message: 'Réparation supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get repairs by status
const getRepairsByStatus = async (req, res) => {
  try {
    const repairs = await Repair.find({ status: req.params.status })
      .populate('assignedStaff', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(repairs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get repairs by priority
const getRepairsByPriority = async (req, res) => {
  try {
    const repairs = await Repair.find({ priority: req.params.priority })
      .populate('assignedStaff', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(repairs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assign repair to staff member
const assignRepair = async (req, res) => {
  try {
    const repair = await Repair.findById(req.params.id);
    
    if (!repair) {
      return res.status(404).json({ message: 'Réparation non trouvée' });
    }

    repair.assignedStaff = req.body.staffIds || [];
    repair.status = 'in_progress';
    repair.updatedAt = new Date();
    
    const updatedRepair = await repair.save();
    await updatedRepair.populate('assignedStaff', 'name email');
    
    res.json(updatedRepair);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update repair status
const updateRepairStatus = async (req, res) => {
  try {
    const repair = await Repair.findById(req.params.id);
    
    if (!repair) {
      return res.status(404).json({ message: 'Réparation non trouvée' });
    }

    repair.status = req.body.status;
    repair.updatedAt = new Date();
    
    const updatedRepair = await repair.save();
    await updatedRepair.populate('assignedStaff', 'name email');
    
    res.json(updatedRepair);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getRepairs,
  getRepair,
  createRepair,
  updateRepair,
  deleteRepair,
  getRepairsByStatus,
  getRepairsByPriority,
  assignRepair,
  updateRepairStatus
}; 