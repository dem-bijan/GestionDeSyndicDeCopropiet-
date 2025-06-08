const mongoose = require('mongoose');

const repairSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed'],
    default: 'pending'
  },
  assignedStaff: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  }],
  cost: {
    type: Number,
    default: 0
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  completionDate: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Repair = mongoose.model('Repair', repairSchema);
module.exports = Repair; 