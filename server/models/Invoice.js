const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  resident: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resident',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['paid', 'unpaid'],
    default: 'unpaid'
  },
  description: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  type: {
    type: String,
    enum: ['cotisation', 'tax', 'repair'],
    required: true
  }
});

const Invoice = mongoose.model('Invoice', invoiceSchema);
module.exports = Invoice; 