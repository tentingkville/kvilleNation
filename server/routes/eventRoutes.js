const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const Event = require('../models/eventModel');

// Get all events
router.get('/events', authenticateToken, async (req, res) => {
    try {
        const events = await Event.find({});
        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});

// Create an event
router.post('/create', authenticateToken, async (req, res) => {
  const { name, startDate, startTime, endDate, endTime } = req.body;

  if (!name || !startDate || !startTime) {
    return res.status(400).send({ error: 'Name, startDate, and startTime are required' });
  }

  try {
    const newEvent = new Event({ name, startDate, startTime, endDate, endTime });
    await newEvent.save();
    res.status(201).send(newEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
});

// Update an event
router.put('/update/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name, startDate, startTime, endDate, endTime } = req.body;

    try {
        const updatedEvent = await Event.findByIdAndUpdate(
            id,
            { name, startDate, startTime, endDate, endTime },
            { new: true }
        );

        if (!updatedEvent) {
            return res.status(404).send({ error: 'Event not found' });
        }

        res.status(200).send(updatedEvent);
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});

// Delete an event
router.delete('/delete/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        const deletedEvent = await Event.findByIdAndDelete(id);

        if (!deletedEvent) {
            return res.status(404).send({ error: 'Event not found' });
        }

        res.status(200).send({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});

module.exports = router;