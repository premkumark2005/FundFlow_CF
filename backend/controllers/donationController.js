const Donation = require('../models/Donation');
const Campaign = require('../models/Campaign');
const User = require('../models/User');
const { sendDonorThankYouEmail, sendCreatorDonationNotification } = require('../utils/email');

// @desc    Create a donation (no external payment gateway)
// @route   POST /api/donations
// @access  Private
const createDonation = async (req, res) => {
  try {
    const { campaignId, amount, anonymous, message, cardLast4, cardBrand } = req.body;

    const campaign = await Campaign.findById(campaignId).populate('creatorId', 'name email');
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Get donor information
    const donor = await User.findById(req.user.id);
    if (!donor) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create donation as completed immediately
    const donation = new Donation({
      donorId: req.user.id,
      campaignId,
      amount,
      anonymous: anonymous || false,
      message,
      paymentId: 'demo_' + Date.now(),
      paymentStatus: 'completed',
      // Do NOT store full card details; optionally capture last4/brand in message if needed
    });

    const savedDonation = await donation.save();

    // Update campaign totals
    await Campaign.findByIdAndUpdate(
      campaignId,
      { $inc: { raisedAmount: amount, donorsCount: 1 } }
    );

    // ✅ Send email notifications asynchronously (don't wait for completion)
    setImmediate(async () => {
      try {
        // Send thank-you email to donor
        if (donor.email) {
          await sendDonorThankYouEmail(
            { email: donor.email, name: donor.name },
            { title: campaign.title, creatorName: campaign.creatorId?.name || 'Campaign Creator' },
            amount
          );
        }

        // Send notification email to campaign creator
        if (campaign.creatorId && campaign.creatorId.email) {
          await sendCreatorDonationNotification(
            { email: campaign.creatorId.email, name: campaign.creatorId.name },
            { title: campaign.title, id: campaign._id },
            { 
              amount, 
              donorName: donor.name,
              message: message || '',
              anonymous: anonymous || false
            }
          );
        }
      } catch (emailError) {
        // Don't fail the donation if email fails
        console.error('❌ Error sending donation emails:', emailError.message);
      }
    });

    res.json({ donation: savedDonation });
  } catch (error) {
    console.error('Create donation error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update donation status
// @route   POST /api/donations/update-status
// @access  Private
const updateDonationStatus = async (req, res) => {
  try {
    const { paymentIntentId, status } = req.body;
    
    const donation = await Donation.findOne({ paymentId: paymentIntentId });
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    donation.paymentStatus = status;
    await donation.save();

    if (status === 'completed') {
      // Update campaign raised amount
      await Campaign.findByIdAndUpdate(
        donation.campaignId,
        { 
          $inc: { 
            raisedAmount: donation.amount,
            donorsCount: 1
          } 
        }
      );
    }

    res.json({ message: 'Donation status updated', donation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's donations
// @route   GET /api/donations/user/:userId
// @access  Private
const getUserDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ donorId: req.params.userId })
      .populate('campaignId', 'title images')
      .sort({ date: -1 });
    
    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createDonation,
  updateDonationStatus,
  getUserDonations
};
