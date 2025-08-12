const express = require('express');
const router = express.Router();
const AirtableConfig = require('../models/airtableConfigModel');
const { getAirtableConfig, invalidateAirtableCache, maskKey } = require('../lib/airtableConfig');

router.get('/', async (_req, res) => {
  try {
    const cfg = await getAirtableConfig();
    return res.json({
      _id: cfg._id,
      hasApiKey: Boolean(cfg.airtableApiKey),
      maskedApiKey: maskKey(cfg.airtableApiKey),
      airtableBaseId: cfg.airtableBaseId || '',
      airtableTableId: cfg.airtableTableId || '',
      updatedAt: cfg.updatedAt || null,
    });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to load Airtable config.' });
  }
});

/** PUT /api/airtable-config */
router.put('/', async (req, res) => {
  try {
    const { airtableApiKey, airtableBaseId, airtableTableId } = req.body || {};
    if (!airtableBaseId || !airtableTableId) {
      return res.status(400).json({ error: 'Base ID and Table ID are required.' });
    }

    const update = { airtableBaseId, airtableTableId };
    if (typeof airtableApiKey === 'string') update.airtableApiKey = airtableApiKey;

    const saved = await AirtableConfig.findByIdAndUpdate(
      'airtable',
      { $set: update },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();

    invalidateAirtableCache();

    return res.json({
      _id: saved._id,
      hasApiKey: Boolean(saved.airtableApiKey),
      maskedApiKey: maskKey(saved.airtableApiKey),
      airtableBaseId: saved.airtableBaseId || '',
      airtableTableId: saved.airtableTableId || '',
      updatedAt: saved.updatedAt,
    });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to save Airtable config.' });
  }
});

module.exports = router;