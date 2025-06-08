const express = require('express');
const {
  getMeetings,
  getMeeting,
  createMeeting,
  updateMeeting,
  deleteMeeting
} = require('../controllers/meetingController.js');

const router = express.Router();

// Get all meetings
router.get('/', getMeetings);

// Get a single meeting
router.get('/:id', getMeeting);

// Create a new meeting
router.post('/', createMeeting);

// Update a meeting
router.put('/:id', updateMeeting);

// Delete a meeting
router.delete('/:id', deleteMeeting);

module.exports = router; 