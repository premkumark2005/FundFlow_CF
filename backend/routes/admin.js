const express = require('express');
const {
  getAllUsers,
  updateUserStatus,
  getAllCampaigns,
  updateCampaignStatus,
  getDashboardStats,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes protected and only accessible by admin
router.use(protect);
router.use(authorize('admin'));

router.get('/users', getAllUsers);
router.put('/users/:id', updateUserStatus);
router.get('/campaigns', getAllCampaigns);
router.put('/campaigns/:id', updateCampaignStatus);
router.get('/stats', getDashboardStats);

module.exports = router;