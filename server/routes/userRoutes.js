const express = require('express');
const bcrypt = require('bcryptjs');
const kvilleProfiles = require('../models/profileModel');
const router = express.Router();

// Registration route
router.post('/register', async (req, res) => {
  const { netID, email, firstName, lastName, password } = req.body;

  if (!netID || !email || !firstName || !lastName || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const existingUser = await kvilleProfiles.findOne({ netID });
    if (existingUser) {
      return res.status(400).json({ error: 'NetID already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new kvilleProfiles({
      netID,
      email,
      firstName,
      lastName,
      password: hashedPassword,
      isLineMonitor: false,
      isSuperUser: false,
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error in registration:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Login route
router.post('/login', async (req, res) => {
  const { netID, password } = req.body;

  // Validation: Ensure required fields are provided
  if (!netID || !password) {
    return res.status(400).json({ error: 'NetID and password are required' });
  }

  try {
    // Check if user exists in the database
    const user = await kvilleProfiles.findOne({ netID });
    if (!user) {
      // User does not exist
      return res.status(404).json({ error: 'Account does not exist. Please register.' });
    }

    // Compare provided password with stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Password mismatch
      return res.status(401).json({ error: 'Incorrect password. Please try again.' });
    }

    // Set session data upon successful login
    req.session.user = {
      netID: user.netID,
      isLineMonitor: user.isLineMonitor,
      isSuperUser: user.isSuperUser,
    };

    // Respond with success
    res.json({
      isAuthenticated: true,
      isLineMonitor: user.isLineMonitor,
      isSuperUser: user.isSuperUser,
    });
  } catch (error) {
    // Catch unexpected errors
    console.error('Error during login:', error.message);
    res.status(500).json({ error: 'Internal server error. Please try again later.' });
  }
});

router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Session destruction error:', err);
            return res.status(500).send('Failed to log out');
        }
        res.clearCookie('connect.sid'); 
        res.send('User logged out successfully');
    });
});

router.get('/check-auth', (req, res) => {
    console.log('Received request on /check-auth');
    console.log('Session data:', req.session);
    if (req.session.user) {
        res.json({
            isAuthenticated: true,
            isLineMonitor: req.session.user.isLineMonitor,
            isSuperUser: req.session.user.isSuperUser,
        });
    } else {
        res.json({ isAuthenticated: false });
    }
});

module.exports = router;
