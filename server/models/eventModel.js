const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  startDate: {
    type: Date,
    required: true, // Start date is mandatory
  },
  startTime: {
    type: String, // Optional time in HH:mm format
    default: null,
  },
  endDate: {
    type: Date, // Optional end date
    default: null,
  },
  endTime: {
    type: String, // Optional end time in HH:mm format
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware to update the `updatedAt` field on every save
eventSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;