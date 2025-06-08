const Meeting = require('../models/Meeting.js');
const Message = require('../models/Message.js');
const Resident = require('../models/Resident.js');

// Get all meetings
const getMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find()
      .populate('attendees', 'name email')
      .sort({ date: 1 });
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single meeting
const getMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id)
      .populate('attendees', 'name email');
    
    if (!meeting) {
      return res.status(404).json({ message: 'Réunion non trouvée' });
    }
    
    res.json(meeting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new meeting
const createMeeting = async (req, res) => {
  const meeting = new Meeting({
    title: req.body.title,
    description: req.body.description,
    date: req.body.date,
    location: req.body.location,
    attendees: req.body.attendees,
    status: req.body.status || 'scheduled'
  });

  try {
    const newMeeting = await meeting.save();
    await newMeeting.populate('attendees', 'name email');
    // Send a message to each resident
    const residents = await Resident.find();
    const subject = 'Nouvelle réunion programmée';
    const content = `Une nouvelle réunion a été programmée :\n\nTitre : ${meeting.title}\nDate : ${meeting.date}\nHeure : ${req.body.time || ''}\nLieu : ${meeting.location}`;
    for (const resident of residents) {
      await Message.create({
        sender: 'admin',
        recipient: resident._id.toString(),
        subject,
        content
      });
    }
    res.status(201).json(newMeeting);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a meeting
const updateMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    
    if (!meeting) {
      return res.status(404).json({ message: 'Réunion non trouvée' });
    }

    Object.assign(meeting, req.body);
    const updatedMeeting = await meeting.save();
    await updatedMeeting.populate('attendees', 'name email');
    
    res.json(updatedMeeting);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a meeting
const deleteMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    
    if (!meeting) {
      return res.status(404).json({ message: 'Réunion non trouvée' });
    }

    await meeting.deleteOne();
    res.json({ message: 'Réunion supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get upcoming meetings
const getUpcomingMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({
      date: { $gte: new Date() },
      status: 'scheduled'
    })
      .populate('attendees', 'name email')
      .sort({ date: 1 });
    
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update meeting status
const updateMeetingStatus = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    
    if (!meeting) {
      return res.status(404).json({ message: 'Réunion non trouvée' });
    }

    meeting.status = req.body.status;
    const updatedMeeting = await meeting.save();
    await updatedMeeting.populate('attendees', 'name email');
    
    res.json(updatedMeeting);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getMeetings,
  getMeeting,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  getUpcomingMeetings,
  updateMeetingStatus
}; 