const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: String, required: true }, // peut être 'admin' ou un id utilisateur
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, default: 'GENERAL' }, // e.g. 'COMPLAINT', 'INVOICE', etc.
  relatedId: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', default: null },
  date: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
});

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification; 