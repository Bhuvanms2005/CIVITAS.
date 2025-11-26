const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const {  getMyComplaints, reraiseComplaint,getCityComplaintStats, getLocalComplaints, supportComplaint, getSimilarComplaints, ngoResolveComplaint, uploadMiddlewareNGOResolutionPhoto } = require('../components/controllers/complaintController'); 
const { createComplaint } = require('../components/controllers/complaintController');
const uploadComplaintPhoto = require('../middleware/uploadComplaintPhoto');

router.post(
  '/',
  protect,
  uploadComplaintPhoto,
  createComplaint
);
router.get(
  '/my',
  protect, 
  getMyComplaints
);
router.post(
  '/:id/reraise', 
  protect,
  reraiseComplaint
);
router.get(
  '/city-stats', 
  protect, 
  getCityComplaintStats
);
router.get(
  '/local', 
  protect, 
  getLocalComplaints
);
router.post(
  '/:id/support',
  protect,
  supportComplaint
)
router.get(
  '/similar', 
  protect, 
  getSimilarComplaints
);
router.post(
  '/:id/ngo-resolution', 
  protect, 
  authorizeRoles('ngo'), 
  uploadMiddlewareNGOResolutionPhoto, 
  ngoResolveComplaint 
);

module.exports = router;