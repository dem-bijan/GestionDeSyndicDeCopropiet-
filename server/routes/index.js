const express = require('express');
const residentRoutes = require('./residentRoutes.js');
const staffRoutes = require('./staffRoutes.js');
const repairRoutes = require('./repairRoutes.js');
const meetingRoutes = require('./meetingRoutes.js');
const garageRoutes = require('./garageRoutes.js');
const invoiceRoutes = require('./invoiceRoutes.js');
const authRoutes = require('./auth.js');
const messageRoutes = require('./messageRoutes.js');
const notificationRoutes = require('./notificationRoutes.js');
const complaintRoutes = require('./complaintRoutes.js');

const router = express.Router();

router.use('/residents', residentRoutes);
router.use('/staff', staffRoutes);
router.use('/repairs', repairRoutes);
router.use('/meetings', meetingRoutes);
router.use('/garage', garageRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/auth', authRoutes);
router.use('/messages', messageRoutes);
router.use('/notifications', notificationRoutes);
router.use('/complaints', complaintRoutes);

module.exports = router; 