const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createDonation,
  updateDonationStatus,
  getUserDonations
} = require('../controllers/donationController');
const Campaign = require('../models/Campaign');
const User = require('../models/User');
const Donation = require('../models/Donation');
const { sendDonorThankYouEmail, sendCreatorDonationNotification } = require('../utils/email');

// Stripe PaymentIntent endpoint (test mode, no real money)
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required');
}
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, campaignId } = req.body;
    
    if (!amount || !campaignId) {
      return res.status(400).json({ error: 'Amount and campaignId are required' });
    }
    
    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: { campaignId },
      // Use automatic_payment_methods for better compatibility
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      }
    });
    
    console.log('Payment intent created:', paymentIntent.id);
    
    // Return only the client secret
    res.json({ 
      clientSecret: paymentIntent.client_secret 
    });
    
  } catch (err) {
    console.error('Error creating payment intent:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Manual donation endpoints (no external payment gateway)

// Create a donation (requires auth)
router.post('/', protect, createDonation);

// Record Stripe donation with email notifications
router.post('/record-stripe-donation', protect, async (req, res) => {
  try {
    const { campaignId, amount, anonymous, message, paymentId } = req.body;

    if (!campaignId || !amount || !paymentId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Get campaign with creator info
    const campaign = await Campaign.findById(campaignId).populate('creatorId', 'name email');
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Get donor information
    const donor = await User.findById(req.user.id);
    if (!donor) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create donation record
    const donation = new Donation({
      donorId: req.user.id,
      campaignId,
      amount,
      anonymous: anonymous || false,
      message: message || '',
      paymentId,
      paymentStatus: 'completed',
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
          console.log('Sending thank-you email to donor:', donor.email);
          await sendDonorThankYouEmail(
            { email: donor.email, name: donor.name },
            { title: campaign.title, creatorName: campaign.creatorId?.name || 'Campaign Creator' },
            amount
          );
        }

        // Send notification email to campaign creator
        if (campaign.creatorId && campaign.creatorId.email) {
          console.log('Sending notification email to creator:', campaign.creatorId.email);
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

    // Return success immediately without waiting for emails
    res.json({ 
      success: true,
      donation: savedDonation,
      message: 'Donation recorded successfully! Email notifications are being sent.'
    });
  } catch (error) {
    console.error('Error recording Stripe donation:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update donation status (requires auth) - retained for compatibility
router.post('/update-status', protect, updateDonationStatus);

// Get donations for a user
router.get('/user/:userId', protect, getUserDonations);

module.exports = router;