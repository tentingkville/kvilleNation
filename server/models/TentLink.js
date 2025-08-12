const mongoose = require('mongoose');

const tentLinkSchema = new mongoose.Schema({
  url: { type: String, required: true },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('TentLink', tentLinkSchema);