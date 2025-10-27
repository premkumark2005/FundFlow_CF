const express = require('express');
const {
  updateProfile,
  getUserProfile,
  uploadProfilePicture,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateProfile);

router.route('/upload-profile-pic')
  .post(protect, upload.single('image'), uploadProfilePicture);

module.exports = router;