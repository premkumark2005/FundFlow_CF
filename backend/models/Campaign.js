const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  shortDescription: {
    type: String,
    maxlength: 200
  },
  goal: {
    type: Number,
    required: true,
    min: 1
  },
  raisedAmount: {
    type: Number,
    default: 0
  },
  deadline: {
    type: Date,
    required: true
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Education', 'Health', 'Tech', 'Charity', 'Environment', 'Arts', 'Other']
  },
  images: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['active', 'completed', 'suspended', 'pending'],
    default: 'pending'
  },
  updates: [{
    title: String,
    content: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  donorsCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

campaignSchema.virtual('daysLeft').get(function() {
  const now = new Date();
  const deadline = new Date(this.deadline);
  return Math.max(0, Math.ceil((deadline - now) / (1000 * 60 * 60 * 24)));
});

campaignSchema.virtual('progress').get(function() {
  return (this.raisedAmount / this.goal) * 100;
});

module.exports = mongoose.model('Campaign', campaignSchema);