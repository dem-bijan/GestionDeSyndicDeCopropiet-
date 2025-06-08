const Invoice = require('../models/Invoice.js');
const Notification = require('../models/Notification.js');

// Get all invoices
const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find().populate('resident', 'name email');
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get invoices by resident
const getInvoicesByResident = async (req, res) => {
  try {
    const invoices = await Invoice.find({ resident: req.params.residentId }).populate('resident', 'name email');
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get unpaid invoices by resident
const getUnpaidInvoicesByResident = async (req, res) => {
  try {
    const invoices = await Invoice.find({ resident: req.params.residentId, status: 'unpaid' }).populate('resident', 'name email');
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create invoice
const createInvoice = async (req, res) => {
  try {
    const Resident = require('../models/Resident.js');
    const { resident, amount, dueDate, description, type, residents } = req.body;
    if (type === 'cotisation' && residents === 'all') {
      // Create a cotisation invoice for each resident
      const allResidents = await Resident.find();
      const invoices = [];
      for (const r of allResidents) {
        const invoice = new Invoice({ resident: r._id, amount, dueDate, description, type });
        await invoice.save();
        invoices.push(invoice);
        // Create notification for each resident
        const notif = new Notification({
          recipient: r._id.toString(),
          title: 'Nouvelle cotisation',
          content: `Une nouvelle cotisation de ${amount} DH est disponible.`,
          type: 'INVOICE',
          relatedId: invoice._id
        });
        await notif.save();
      }
      return res.status(201).json({ message: 'Cotisation invoices created for all residents', invoices });
    } else {
      // For tax and repair, always create a notification for the resident
      const residentExists = await Resident.findById(resident);
      if (!residentExists) {
        return res.status(400).json({ message: 'Resident not found' });
      }
      const invoice = new Invoice({ resident, amount, dueDate, description, type });
    await invoice.save();
      // Notification title and content based on type
      let notifTitle = 'Nouvelle facture';
      let notifContent = `Une nouvelle facture de ${amount} DH est disponible.`;
      if (type === 'tax') {
        notifTitle = 'Nouvelle taxe';
        notifContent = `Une nouvelle taxe de ${amount} DH est disponible.`;
      } else if (type === 'repair') {
        notifTitle = 'Nouvelle réparation';
        notifContent = `Une nouvelle facture de réparation de ${amount} DH est disponible.`;
      }
      // DEBUG: Log resident and recipient
      console.log('[DEBUG] Creating notification:', {
        resident,
        residentType: typeof resident,
        recipient: resident.toString(),
        recipientType: typeof resident.toString()
      });
      const notif = new Notification({
        recipient: resident.toString(),
        title: notifTitle,
        content: notifContent,
        type: 'INVOICE',
        relatedId: invoice._id
      });
      await notif.save();
    res.status(201).json(invoice);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update invoice
const updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!invoice) return res.status(404).json({ message: 'Facture non trouvée' });
    res.json(invoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete invoice
const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Facture non trouvée' });
    res.json({ message: 'Facture supprimée' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getInvoices,
  getInvoicesByResident,
  getUnpaidInvoicesByResident,
  createInvoice,
  updateInvoice,
  deleteInvoice
}; 