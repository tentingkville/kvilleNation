const express = require('express');
const SeasonStatus = require('../models/SeasonStatus');
const router = express.Router();

// GET — public
router.get('/', async (req, res) => {
  try {
    const statusDoc = await SeasonStatus.findOne().sort({ updatedAt: -1 });

    // If no document yet, default to in-season
    res.json({ inSeason: statusDoc?.inSeason ?? true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST — admin only (add your admin middleware if needed)
router.post('/', async (req, res) => {
  try {
    const { inSeason } = req.body;

    if (typeof inSeason !== 'boolean') {
      return res.status(400).json({ error: 'inSeason must be boolean' });
    }

    let statusDoc = await SeasonStatus.findOne();

    if (statusDoc) {
      statusDoc.inSeason = inSeason;
      await statusDoc.save();
    } else {
      statusDoc = await SeasonStatus.create({ inSeason });
    }

    res.json({ success: true, inSeason: statusDoc.inSeason });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;