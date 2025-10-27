const User = require('../models/User');

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, bio, socialLinks } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, bio, socialLinks },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate({
        path: 'campaigns',
        select: 'title description goal raisedAmount deadline category images status'
      });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload profile picture
// @route   POST /api/users/upload-profile-pic
// @access  Private
const uploadProfilePicture = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePic: req.file.path },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  updateProfile,
  getUserProfile,
  uploadProfilePicture,
};