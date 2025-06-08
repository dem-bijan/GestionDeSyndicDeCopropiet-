const express = require('express');
const {
  getInvoices,
  getInvoicesByResident,
  getUnpaidInvoicesByResident,
  createInvoice,
  updateInvoice,
  deleteInvoice
} = require('../controllers/invoiceController.js');
const { verifyToken } = require('../middleware/auth.js');
const Invoice = require('../models/Invoice.js');

const router = express.Router();

router.get('/', getInvoices);
router.get('/resident/:residentId', getInvoicesByResident);
router.get('/resident/:residentId/unpaid', getUnpaidInvoicesByResident);
router.post('/', createInvoice);
router.put('/:id', updateInvoice);
router.delete('/:id', deleteInvoice);

// Récupérer les factures d'un résident
router.get('/resident', verifyToken, async (req, res) => {
  try {
    const residentId = req.user.id;
    const invoices = await Invoice.find({ resident: residentId })
      .sort({ date: -1 })
      .populate('resident', 'firstName lastName');

    res.json(invoices);
  } catch (error) {
    console.error('Erreur lors de la récupération des factures:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des factures' });
  }
});

module.exports = router; 