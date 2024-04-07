const express = require('express');
const Tent = require('../models/tentModel');  
const router = express.Router();

router.get('/tents', async (req, res) => {
    try {
        const tents = await Tent.find({});
        res.json(tents);
    } catch (error) {
        console.error(error);  // Log the error for debugging
        res.status(500).send('Server error');
    }
});

module.exports = router;
