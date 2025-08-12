const AirtableConfig = require('../models/airtableConfigModel');

let cache = null;
let cacheAt = 0;
const TTL_MS = 60 * 1000; // 1 minute cache

function maskKey(key) {
  if (!key) return '';
  const last4 = key.slice(-4);
  return `**** **** **** ${last4}`;
}

async function getAirtableConfig({ force = false } = {}) {
  const now = Date.now();
  if (!force && cache && now - cacheAt < TTL_MS) return cache;

  const doc = await AirtableConfig.findById('airtable').lean();
  cache = doc || {
    _id: 'airtable',
    airtableApiKey: '',
    airtableBaseId: '',
    airtableTableId: '',
    updatedAt: null,
  };
  cacheAt = now;
  return cache;
}

function invalidateAirtableCache() {
  cache = null;
  cacheAt = 0;
}

module.exports = { getAirtableConfig, invalidateAirtableCache, maskKey };