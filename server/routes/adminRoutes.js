const express = require('express');
const kvilleProfiles = require('../models/profileModel');
const authenticateToken = require('../middleware/authenticateToken'); // Middleware
const router = express.Router();

// Route to get all users
router.get('/users', authenticateToken, async (req, res) => {
  try {
    const users = await kvilleProfiles.find({}, 'netID firstName lastName email isLineMonitor isSuperUser');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
});

// Route to update user role
router.post('/update-role', authenticateToken, async (req, res) => {
  const { netID, field, value } = req.body;

  // Validate field
  if (!['isLineMonitor', 'isSuperUser'].includes(field)) {
    return res.status(400).send({ error: 'Invalid role' });
  }

  try {
    const user = await kvilleProfiles.findOneAndUpdate(
      { netID },
      { [field]: value },
      { new: true }
    );

    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    res.status(200).send({ message: `${field} updated successfully`, user });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
});

module.exports = router;