const mongoose = require('mongoose');

const AirtableConfigSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: 'airtable',
      immutable: true,
    },
    airtableApiKey: {
      type: String,
      default: '',
      trim: true,
    },
    airtableBaseId: {
      type: String,
      required: true,
      trim: true,
    },
    airtableTableId: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AirtableConfig', AirtableConfigSchema);