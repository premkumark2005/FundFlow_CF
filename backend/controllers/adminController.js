const User = require('../models/User');
const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user status
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all campaigns
// @route   GET /api/admin/campaigns
// @access  Private/Admin
const getAllCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find()
      .populate('creatorId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update campaign status
// @route   PUT /api/admin/campaigns/:id
// @access  Private/Admin
const updateCampaignStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('creatorId', 'name email');

    res.json(campaign);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCampaigns = await Campaign.countDocuments();
    const totalDonations = await Donation.countDocuments();
    const totalRaised = await Donation.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const recentDonations = await Donation.find()
      .populate('donorId', 'name')
      .populate('campaignId', 'title')
      .sort({ date: -1 })
      .limit(10);

    res.json({
      totalUsers,
      totalCampaigns,
      totalDonations,
      totalRaised: totalRaised[0]?.total || 0,
      recentDonations
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllUsers,
  updateUserStatus,
  getAllCampaigns,
  updateCampaignStatus,
  getDashboardStats,
};