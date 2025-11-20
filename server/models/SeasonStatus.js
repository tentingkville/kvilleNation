const mongoose = require('mongoose');

const SeasonStatusSchema = new mongoose.Schema(
  {
    inSeason: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SeasonStatus', SeasonStatusSchema);