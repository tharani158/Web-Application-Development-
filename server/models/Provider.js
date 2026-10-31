const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema(
  {
    providerName: {
      type: String,
      required: [true, 'Provider name is required'],
      trim: true,
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Provider description is required'],
      trim: true,
    },
    profileImage: {
      type: String,
      default: '/images/provider-default.png',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Provider', providerSchema);
