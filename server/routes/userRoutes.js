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
            password: hashedPassword
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

    try {
        const user = await kvilleProfiles.findOne({ netID });
        if (!user) {
            return res.status(400).send('User not found');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send('Invalid credentials');
        }

        res.send('User logged in successfully');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;
