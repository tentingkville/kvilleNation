const express = require('express');
const TentLink = require('../models/TentLink');
const router = express.Router();

// GET
router.get('/', async (req, res) => {
  try {
    const linkDoc = await TentLink.findOne().sort({ updatedAt: -1 });
    res.json(linkDoc || { url: null, active: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST
router.post('/', async (req, res) => {
  try {
    const { url, active } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    let linkDoc = await TentLink.findOne();
    if (linkDoc) {
      linkDoc.url = url;
      linkDoc.active = active;
      await linkDoc.save();
    } else {
      linkDoc = await TentLink.create({ url, active });
    }

    res.json({ success: true, url: linkDoc.url, active: linkDoc.active });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;