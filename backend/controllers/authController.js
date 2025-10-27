const mongoose = require('mongoose');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Input validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'Please provide all required fields: name, email, and password' 
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'donor'
    });

    // Generate token
    const token = generateToken(user._id);

    // Send response
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
      message: 'Registration successful'
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: Object.values(error.errors).map(e => e.message).join(', ') });
    }
    res.status(500).json({ message: 'An error occurred during registration' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    console.log('Login attempt:', { email: req.body.email }); // Log login attempt

    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Missing credentials');
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      console.error('Database not connected. Current state:', mongoose.connection.readyState);
      return res.status(500).json({ message: 'Database connection error' });
    }

    console.log('Searching for user in database...');
    
    // Find user and explicitly include password
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('No user found with email:', email);
      return res.status(401).json({ message: 'No user found with this email' });
    }

    console.log('User found, verifying password...');
    
    const isPasswordCorrect = await user.correctPassword(password, user.password);
    
    if (!isPasswordCorrect) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ message: 'Invalid password' });
    }

    console.log('Password verified, generating token...');
    
    // Create token and send response
    const token = generateToken(user._id);

    // Remove password from response
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePic: user.profilePic,
      token
    };

    console.log('Login successful for user:', email);
    res.json(userResponse);
  } catch (error) {
    console.error('Login error:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      message: 'An error occurred during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, getMe };
