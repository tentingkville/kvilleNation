const AirtableConfig = require('../models/airtableConfigModel');

let _cache = null;
let _cacheAt = 0;
const TTL_MS = 30_000; // 30s; tweak as you like

function invalidateAirtableCache() {
  _cache = null;
  _cacheAt = 0;
}

function maskKey(key = '') {
  if (!key) return '';
  const last4 = key.slice(-4);
  return `****${last4}`;
}

async function getAirtableConfig() {
  const now = Date.now();

  // If we have a recent cache that looks valid, use it
  if (
    _cache &&
    (now - _cacheAt) < TTL_MS &&
    _cache.airtableBaseId &&
    _cache.airtableTableId
  ) {
    return _cache;
  }

  // Always try DB
  const doc = await AirtableConfig.findById('airtable').lean();

  // If DB has nothing yet, return an "empty" shape (but DON'T cache empties)
  if (!doc) {
    return {
      _id: 'airtable',
      airtableApiKey: '',
      airtableBaseId: '',
      airtableTableId: '',
      updatedAt: null,
    };
  }

  // Cache only if it contains the required IDs
  if (doc.airtableBaseId && doc.airtableTableId) {
    _cache = doc;
    _cacheAt = now;
  }

  return doc;
}

module.exports = { getAirtableConfig, invalidateAirtableCache, maskKey };