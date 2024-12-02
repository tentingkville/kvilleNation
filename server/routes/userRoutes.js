const express = require('express');
const bcrypt = require('bcryptjs');
const kvilleProfiles = require('../models/profileModel');
const router = express.Router();

// Registration route
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

        // Set the user information in the session
        req.session.user = {
            netID: user.netID,
            isLineMonitor: user.isLineMonitor,
            isSuperUser: user.isSuperUser,
        };

        res.send({
            isAuthenticated: true,
            isLineMonitor: user.isLineMonitor,
            isSuperUser: user.isSuperUser,
        });
    } catch (error) {
        res.status(500).send(error.message);
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
