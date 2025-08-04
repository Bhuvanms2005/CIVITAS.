const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware'); 
const { getUserProfile, updateProfile, deleteProfile, getLeaderboard, getAssignees  } = require('../components/controllers/userController'); 
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateProfile);
router.delete('/profile', protect, deleteProfile);
router.get('/leaderboard', protect, getLeaderboard);
router.get(
  '/assignees', 
  protect, 
  authorizeRoles('admin'), 
  getAssignees
);
module.exports = router;