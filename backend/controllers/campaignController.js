const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');

// @desc    Get all campaigns
// @route   GET /api/campaigns
// @access  Public
const getCampaigns = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Only show active campaigns to the public
    const query = { status: 'active' };
    
    if (category && category !== 'All') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const campaigns = await Campaign.find(query)
      .populate('creatorId', 'name profilePic')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Campaign.countDocuments(query);

    res.json({
      campaigns,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single campaign
// @route   GET /api/campaigns/:id
// @access  Public
const getCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('creatorId', 'name profilePic bio socialLinks');

    // Only allow viewing if campaign is active
    if (!campaign || campaign.status !== 'active') {
      return res.status(404).json({ message: 'Campaign not found or not approved' });
    }

    // Get donations for this campaign
    const donations = await Donation.find({ campaignId: req.params.id })
      .populate('donorId', 'name profilePic')
      .sort({ date: -1 });

    res.json({ campaign, donations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a campaign
// @route   POST /api/campaigns
// @access  Private (Creator)
const createCampaign = async (req, res) => {
  try {
    const {
      title,
      description,
      shortDescription,
      goal,
      deadline,
      category
    } = req.body;

    // Validate required fields
    if (!title || !description || !goal || !deadline || !category) {
      return res.status(400).json({
        message: 'Missing required fields. Please provide title, description, goal, deadline, and category.'
      });
    }

    // Create campaign object
    const campaign = new Campaign({
      title,
      description,
      shortDescription,
      goal: Number(goal),
      deadline,
      category,
      creatorId: req.user.id,
      images: req.files ? req.files.map(file => file.path) : [],
      status: 'pending'  // Set initial status as pending
    });

    const createdCampaign = await campaign.save();
    res.status(201).json(createdCampaign);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a campaign
// @route   PUT /api/campaigns/:id
// @access  Private (Creator)
const updateCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Check if user is the creator
    if (campaign.creatorId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updatedCampaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedCampaign);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's campaigns
// @route   GET /api/campaigns/user/:userId
// @access  Private
const getUserCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ creatorId: req.params.userId })
      .populate('creatorId', 'name profilePic');
    
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  getUserCampaigns
};
