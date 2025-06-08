const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  position: {
    type: String,
    required: true,
    enum: ['concierge', 'femme de ménage', 'garagiste']
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  salary: {
    type: Number,
    required: true
  },
  skills: {
    type: [String],
    default: []
  },
  hireDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Staff = mongoose.model('Staff', staffSchema);
module.exports = Staff; 