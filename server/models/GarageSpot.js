const mongoose = require('mongoose');

const garageSpotSchema = new mongoose.Schema({
  spotNumber: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    required: true,
    enum: ['standard', 'large', 'electric']
  },
  status: {
    type: String,
    required: true,
    enum: ['available', 'occupied', 'maintenance'],
    default: 'available'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resident',
    default: null
  },
  assignmentDate: {
    type: Date,
    default: null
  },
  monthlyFee: {
    type: Number,
    required: true
  },
  lastMaintenance: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const GarageSpot = mongoose.model('GarageSpot', garageSpotSchema);
module.exports = GarageSpot; 