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
// Create an event (new approach)
router.post('/create', authenticateToken, async (req, res) => {
  const { name, startDateTime, endDateTime } = req.body;

  // name & startDateTime are required
  if (!name || !startDateTime) {
    return res.status(400).send({ error: 'Name and startDateTime are required' });
  }

  try {
    // store them in the new schema fields
    const newEvent = new Event({
      name,
      startDateTime,  // e.g. "2025-01-12T14:00:00.000Z"
      endDateTime,    // optional
    });

    await newEvent.save();
    return res.status(201).send(newEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
});
// Update an event
router.put('/update/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, startDateTime, endDateTime } = req.body;

  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { name, startDateTime, endDateTime },
      { new: true } // return the updated doc
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