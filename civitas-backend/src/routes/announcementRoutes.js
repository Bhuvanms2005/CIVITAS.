// src/backend/routes/announcementRoutes.js

const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const {
  getAnnouncements,
  createAnnouncement, // NEW: Import createAnnouncement
  updateAnnouncement, // NEW: Import updateAnnouncement
  deleteAnnouncement,
  getSingleAnnouncementForAdmin // NEW: Import deleteAnnouncement
} = require('../components/controllers/announcementController'); // Ensure all functions are imported here

// @route   GET /api/announcements (existing - used by Volunteer Dashboard)
// @desc    Get all announcements (optionally filtered by locality/type)
// @access  Private
router.get(
  '/',
  protect,
  getAnnouncements
);

// NEW ROUTE: Create a new announcement
router.post(
  '/', // Route path for creating an announcement
  protect,
  authorizeRoles('admin'), // Only allow 'admin' role
  createAnnouncement
);

// NEW ROUTE: Update an existing announcement
router.put(
  '/:id', // Route with announcement ID parameter
  protect,
  authorizeRoles('admin'),
  updateAnnouncement
);

// NEW ROUTE: Delete an announcement
router.delete(
  '/:id', // Route with announcement ID parameter
  protect,
  authorizeRoles('admin'),
  deleteAnnouncement
);
router.get(
  '/:id', // Route with announcement ID parameter
  protect,
  authorizeRoles('admin'),
  getSingleAnnouncementForAdmin
);
module.exports = router;