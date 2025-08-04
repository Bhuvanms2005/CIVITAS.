const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware'); 
const { assignComplaint, getAllComplaintsForAdmin, getComplaintDetailsForAdmin, updateComplaintStatusAndNotes, uploadBeforeAfterPhoto, uploadMiddlewareBeforeAfter, deleteComplaint, getDashboardStatsForAdmin, getLocalityZoneConditions, getRecentActivity, getAllUsers, updateUserDetails, changeUserRole, getSingleUserForAdmin, deleteUserByAdmin, getAllNGOs, getSingleNGOForAdmin, updateNGODetails, deleteNGOByAdmin} = require('../components/controllers/adminController'); 
router.get(
  '/complaints',
  protect,
  authorizeRoles('admin'),
  getAllComplaintsForAdmin
);
router.put(
  '/complaints/:id/assign',
  protect,
  authorizeRoles('admin'), 
  assignComplaint
);
router.get(
  '/complaints/:id', 
  protect,
  authorizeRoles('admin'),
  getComplaintDetailsForAdmin
);
router.put(
  '/complaints/:id/status', 
  protect,
  authorizeRoles('admin'), 
  updateComplaintStatusAndNotes
);
router.post(
  '/complaints/:id/photos', 
  protect,
  authorizeRoles('admin'), 
  uploadMiddlewareBeforeAfter, 
  uploadBeforeAfterPhoto 
);
router.delete(
  '/complaints/:id', 
  protect,
  authorizeRoles('admin'),
  deleteComplaint
);
router.get(
  '/dashboard-stats',
  protect,
  authorizeRoles('admin'),
  getDashboardStatsForAdmin
);
router.get(
  '/zones/conditions', 
  protect, 
  authorizeRoles('admin'),
  getLocalityZoneConditions
);
router.get(
  '/activity-feed', 
  protect, 
  authorizeRoles('admin'),
  getRecentActivity
);
router.get(
  '/users', 
  protect,
  authorizeRoles('admin'),
  getAllUsers
);
router.get(
  '/users/:id', // Route with user ID parameter
  protect,
  authorizeRoles('admin'),
  getSingleUserForAdmin
);

router.put(
  '/users/:id', // Route with user ID parameter
  protect,
  authorizeRoles('admin'),
  updateUserDetails
);
router.put(
  '/users/:id/role', // Route with user ID and specific for role change
  protect,
  authorizeRoles('admin'),
  changeUserRole
);
router.delete(
  '/users/:id', // Route with user ID parameter
  protect,
  authorizeRoles('admin'),
  deleteUserByAdmin
);
router.get(
  '/ngos', // Define the new route path
  protect,
  authorizeRoles('admin'),
  getAllNGOs
);
router.get(
  '/ngos/:id', // Get a single NGO's details
  protect,
  authorizeRoles('admin'),
  getSingleNGOForAdmin
);

router.put(
  '/ngos/:id', // Update a single NGO's details
  protect,
  authorizeRoles('admin'),
  updateNGODetails
);
router.delete(
  '/ngos/:id', // Route with NGO user ID parameter
  protect,
  authorizeRoles('admin'),
  deleteNGOByAdmin // This is the route for deleting an NGO specifically.
);
module.exports = router;