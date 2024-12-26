const express = require('express');
const bcrypt = require('bcryptjs');
const kvilleProfiles = require('../models/profileModel');
const router = express.Router();
const jwt = require('jsonwebtoken');
const authenticateToken = require('../middleware/authenticateToken'); // Import middleware

router.get('/profile', authenticateToken, (req, res) => {
    res.json({
        netID: req.user.netID,
        isLineMonitor: req.user.isLineMonitor,
        isSuperUser: req.user.isSuperUser,
    });
});
router.post('/register', async (req, res) => {
    const { netID, email, firstName, lastName, password } = req.body;

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new kvilleProfiles({
            netID,
            email,
            firstName,
            lastName,
            password: hashedPassword,
            isLineMonitor: false,
            isSuperUser: false
        });

        await newUser.save();
        res.status(201).send('User registered successfully');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { netID, password } = req.body;

    if (!netID || !password) {
        return res.status(400).send('NetID and password are required');
    }

    try {
        const user = await kvilleProfiles.findOne({ netID });
        if (!user) {
            return res.status(400).send('User not found');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send('Invalid credentials');
        }

        // Generate JWT
        const token = jwt.sign(
            {
                netID: user.netID,
                isLineMonitor: user.isLineMonitor,
                isSuperUser: user.isSuperUser,
            },
            process.env.JWT_SECRET,
            { expiresIn: '4d' }
        );

        // Send the response
        return res.json({
            token,
            isLineMonitor: user.isLineMonitor,
            isSuperUser: user.isSuperUser,
        });
    } catch (error) {
        console.error('Error during login:', error.message);
        return res.status(500).send('Internal server error');
    }
});
// Logout route
router.post('/logout', authenticateToken, (req, res) => {
    res.clearCookie('token');
    res.send('User logged out successfully');
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
router.post('/verify-token', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).send({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.send({
      isAuthenticated: true,
      isLineMonitor: decoded.isLineMonitor,
      isSuperUser: decoded.isSuperUser,
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).send({ error: 'Invalid token' });
  }
});

module.exports = router;
