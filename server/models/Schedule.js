const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema(
  {
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Provider',
    },
    availableDate: {
      type: Date,
      required: [true, 'Available date is required'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Schedule', scheduleSchema);
