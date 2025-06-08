const mongoose = require('mongoose');

const residentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  apartment: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['proprietaire', 'locataire'],
    default: 'proprietaire'
  },
  entryDate: {
    type: Date
  },
  password: {
    type: String
  },
  isFirstLogin: {
    type: Boolean,
    default: true
  }
});

const Resident = mongoose.model('Resident', residentSchema);
module.exports = Resident; 