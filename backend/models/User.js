const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['donor', 'creator', 'admin'],
    default: 'donor'
  },
  profilePic: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: 500
  },
  socialLinks: {
    website: String,
    twitter: String,
    facebook: String,
    instagram: String
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate
userSchema.virtual('campaigns', {
  ref: 'Campaign',
  foreignField: 'creatorId',
  localField: '_id'
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  try {
    return await bcrypt.compare(candidatePassword, userPassword);
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
};

module.exports = mongoose.model('User', userSchema);