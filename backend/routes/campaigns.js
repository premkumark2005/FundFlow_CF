const express = require('express');
const {
  getCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  getUserCampaigns
} = require('../controllers/campaignController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.route('/')
  .get(getCampaigns)
  .post(protect, upload.array('images', 5), createCampaign);

router.route('/:id')
  .get(getCampaign)
  .put(protect, updateCampaign);

router.route('/user/:userId')
  .get(protect, getUserCampaigns);

module.exports = router;