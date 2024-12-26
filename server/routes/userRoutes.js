const express = require('express');
const bcrypt = require('bcryptjs');
const kvilleProfiles = require('../models/profileModel');
const router = express.Router();
const jwt = require('jsonwebtoken');
const authenticateToken = require('../middleware/authenticateToken'); // Import middleware

router.get('/profile', authenticateToken, (req, res) => {
    res.json({
        netID: req.user.netID,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
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

        const token = jwt.sign(
            {
                netID: user.netID,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                isLineMonitor: user.isLineMonitor,
                isSuperUser: user.isSuperUser,
            },
            process.env.JWT_SECRET,
            { expiresIn: '4d' }
        );

        // Send the token and user details
        return res.json({
            token,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            isLineMonitor: user.isLineMonitor,
            isSuperUser: user.isSuperUser,
        });
    } catch (error) {
        console.error('Error during login:', error.message);
        return res.status(500).send('Internal server error');
    }
});
// Logout route
router.post('/logout', (req, res) => {
  try {
    res.status(200).json({ message: 'User logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Failed to log out' });
  }
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
router.post('/verify-token', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user details from the database
    const user = await kvilleProfiles.findOne({ netID: decoded.netID });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      isAuthenticated: true,
      isLineMonitor: decoded.isLineMonitor,
      isSuperUser: decoded.isSuperUser,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });
  } catch (error) {
    console.error('JWT verification error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
});
// Route to update email
router.post('/update-email', authenticateToken, async (req, res) => {
    const { email } = req.body;
    console.log('Email:', email);

    if (!email) {
        return res.status(400).send({ error: 'Email is required' });
    }

    try {
        const user = await kvilleProfiles.findOneAndUpdate(
            { netID: req.user.netID },
            { email },
            { new: true } // Return the updated document
        );

        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        res.status(200).send({ message: 'Email updated successfully', email: user.email });
    } catch (error) {
        console.error('Error updating email:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});

// Route to update password
router.post('/update-password', authenticateToken, async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        return res.status(400).send({ error: 'Both old and new passwords are required' });
    }

    try {
        const user = await kvilleProfiles.findOne({ netID: req.user.netID });

        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);

        if (!isMatch) {
            return res.status(400).send({ error: 'Old password is incorrect' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();

        res.status(200).send({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});


module.exports = router;
