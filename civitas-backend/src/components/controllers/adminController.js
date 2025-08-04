const Complaint = require('../../models/Complaint');
const User = require('../../models/user');
const Locality = require('../../models/Locality');
const complaintAssignmentMap = require('../../config/complaintAssignmentMap');
const { sendEmail } = require('../../utils/emailService');
const multer = require('multer');
const path = require('path');
const fs = require('fs');


const getSuggestedAssigneeId = (category, subType) => {
  const categoryMap = complaintAssignmentMap[category];
  if (categoryMap) {
    return categoryMap[subType] || categoryMap._default;
  }
  return complaintAssignmentMap._default;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `ba_photo-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed for before/after photos!'), false);
  }
};

const uploadBeforeAfter = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

exports.assignComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedToId } = req.body;

    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Only administrators can assign complaints.' });
    }

    const assignee = await User.findById(assignedToId).select('_id firstName lastName email role');
    if (!assignee) {
      return res.status(404).json({ success: false, message: 'Assignee (User/NGO) not found.' });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    if (complaint.assignedTo && complaint.assignedTo.toString() === assignedToId) {
        return res.status(400).json({ success: false, message: 'Complaint is already assigned to this entity.' });
    }


    complaint.assignedTo = assignedToId;
    complaint.updates.push({
      date: new Date(),
      text: `Complaint assigned to ${assignee.firstName || assignee.email} by Admin (${req.user.firstName || req.user.email}).`,
      updatedBy: req.user.id,
    });

    if (complaint.status === 'Pending') {
      complaint.status = 'Process Ongoing';
    }

    await complaint.save();

    const complaintLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/complaint/${complaint._id}`;
    const emailSubject = `New Complaint Assigned: #${complaint._id.toString().substring(0,8)} - ${complaint.subType}`;
    const emailBody = `
      <p>Dear ${assignee.firstName || 'Assignee'},</p>
      <p>A new complaint has been assigned to your department/organization:</p>
      <p><strong>Complaint ID:</strong> ${complaint._id}</p>
      <p><strong>Category:</strong> ${complaint.category}</p>
      <p><strong>Issue:</strong> ${complaint.subType}</p>
      <p><strong>Description:</strong> ${complaint.description}</p>
      <p><strong>Location:</strong> ${complaint.address}</p>
      <p><strong>Severity:</strong> ${complaint.severity}</p>
      <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/complaint/${complaint._id}">View Complaint Details (link not yet functional)</a></p>
      <p>Assigned by: ${req.user.firstName || 'Admin'}</p>
      <p>Thank you,</p>
      <p>The CIVITAS Admin Team</p>
    `;

    try {
        await sendEmail(assignee.email, emailSubject, emailBody);
        console.log(`Complaint ${id} assigned. Email notification sent to ${assignee.email}.`);
    } catch (emailError) {
        console.error(`Failed to send assignment email for complaint ${id} to ${assignee.email}:`, emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Complaint assigned successfully! Notification email sent.',
      complaint: {
        _id: complaint._id,
        status: complaint.status,
        assignedTo: {
            id: assignee._id,
            firstName: assignee.firstName,
            lastName: assignee.lastName,
            email: assignee.email,
            role: assignee.role
        }
      }
    });

  } catch (error) {
    console.error('Error assigning complaint:', error);
    res.status(500).json({ success: false, message: 'Server error during complaint assignment.' });
  }
};


exports.getComplaintDetailsForAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Only administrators can view complaint details.' });
    }

    const complaint = await Complaint.findById(id)
      .populate('submittedBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email');
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }
    const suggestedAssigneeId = getSuggestedAssigneeId(complaint.category, complaint.subType);
    const complaintWithSuggestion = {
      ...complaint.toObject(),
      suggestedAssigneeId: suggestedAssigneeId,
    };

    res.status(200).json({
      success: true,
      complaint: complaintWithSuggestion,
      message: 'Complaint details fetched successfully.'
    });

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid complaint ID format.' });
    }
    console.error('Error fetching complaint details for admin:', error);
    res.status(500).json({ success: false, message: 'Server error fetching complaint details.' });
  }
};
exports.getAllComplaintsForAdmin = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Only administrators can view all complaints.' });
    }

    const complaints = await Complaint.find({})
      .sort({ submittedAt: -1 })
      .populate('submittedBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email');

    const complaintsWithSuggestions = complaints.map(complaint => {
        const suggestedAssigneeId = getSuggestedAssigneeId(complaint.category, complaint.subType);
        return {
            ...complaint.toObject(),
            suggestedAssigneeId: suggestedAssigneeId,
        };
    });

    res.status(200).json({
      success: true,
      count: complaintsWithSuggestions.length,
      complaints: complaintsWithSuggestions,
      message: 'All complaints fetched for admin view successfully.'
    });

  } catch (error) {
    console.error('Error fetching all complaints for admin:', error);
    res.status(500).json({ success: false, message: 'Server error fetching complaints for admin.' });
  }
};
exports.updateComplaintStatusAndNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Only administrators can update complaint status.' });
    }

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    if (status && ['Pending', 'Process Ongoing', 'Resolved', 'Rejected'].includes(status)) {
        complaint.status = status;
    } else if (status) {
        return res.status(400).json({ success: false, message: 'Invalid status provided.' });
    }

    if (note && typeof note === 'string' && note.trim() !== '') {
        complaint.updates.push({
            date: new Date(),
            text: note.trim(),
            updatedBy: req.user.id,
        });
    }

    await complaint.save();
    console.log(`Complaint ${id} status updated to ${complaint.status}. Note added: ${note || 'None'}.`);

    res.status(200).json({
      success: true,
      message: 'Complaint status and notes updated successfully!',
      complaint: {
        _id: complaint._id,
        status: complaint.status,
        updates: complaint.updates,
      }
    });

  } catch (error) {
    if (error.name === 'CastError') {
        return res.status(400).json({ success: false, message: 'Invalid complaint ID format.' });
    }
    console.error('Error updating complaint status/notes:', error);
    res.status(500).json({ success: false, message: 'Server error during status/notes update.' });
  }
};

exports.uploadBeforeAfterPhoto = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Only administrators can upload photos.' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No photo file uploaded.' });
    }

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }
    complaint.beforeAfterPhotos.push({
      url: `/uploads/${req.file.filename}`,
      uploadedBy: req.user.id,
      uploadedAt: new Date(),
    });

    await complaint.save();

    res.status(200).json({
      success: true,
      message: 'Photo uploaded successfully!',
      photo: complaint.beforeAfterPhotos[complaint.beforeAfterPhotos.length - 1],
    });

  } catch (error) {
    if (error instanceof multer.MulterError) {
        return res.status(400).json({ success: false, message: error.message });
    }
    if (error.message === 'Only image files are allowed for before/after photos!') {
        return res.status(400).json({ success: false, message: error.message });
    }
    console.error('Error uploading before/after photo:', error);
    res.status(500).json({ success: false, message: 'Server error during photo upload.' });
  }
};
exports.uploadMiddlewareBeforeAfter = uploadBeforeAfter.single('beforeAfterPhoto');
exports.deleteComplaint = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Only administrators can delete complaints.' });
    }

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    if (complaint.photo && complaint.photo.startsWith('/uploads/')) {
        const filePath = path.join(__dirname, '../../..', complaint.photo);
        try {
            await fs.promises.unlink(filePath);
            console.log(`Deleted main photo file: ${filePath}`);
        } catch (fileError) {
            console.error(`Failed to delete main photo file ${filePath}:`, fileError);
        }
    }
    if (complaint.beforeAfterPhotos && complaint.beforeAfterPhotos.length > 0) {
        for (const photoObj of complaint.beforeAfterPhotos) {
            if (photoObj.url && photoObj.url.startsWith('/uploads/')) {
                const baFilePath = path.join(__dirname, '../../..', photoObj.url);
                try {
                    await fs.promises.unlink(baFilePath);
                    console.log(`Deleted before/after photo file: ${baFilePath}`);
                } catch (fileError) {
                    console.error(`Failed to delete before/after photo file ${baFilePath}:`, fileError);
                }
            }
        }
    }

    await complaint.deleteOne();

    res.status(200).json({ success: true, message: 'Complaint deleted successfully.' });

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid complaint ID format.' });
    }
    console.error('Error deleting complaint:', error);
    res.status(500).json({ success: false, message: 'Server error during complaint deletion.' });
  }
};
exports.getDashboardStatsForAdmin = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Only administrators can view dashboard stats.' });
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    const allComplaints = await Complaint.find();

    const totalComplaints = allComplaints.length;

    const newToday = allComplaints.filter(c => c.submittedAt >= todayStart).length;

    const resolvedThisWeek = allComplaints.filter(c =>
      c.status === 'Resolved' && c.updatedAt >= weekAgo
    ).length;

    const complaintsByStatus = allComplaints.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, { Pending: 0, 'Process Ongoing': 0, Resolved: 0, Rejected: 0 });

    const resolvedComplaintsWithTimes = allComplaints
      .filter(c => c.status === 'Resolved' && c.submittedAt && c.updatedAt)
      .map(c => (c.updatedAt - c.submittedAt) / (1000 * 60 * 60 * 24)); // in days

    const avgResolutionTime = resolvedComplaintsWithTimes.length > 0
      ? (resolvedComplaintsWithTimes.reduce((a, b) => a + b, 0) / resolvedComplaintsWithTimes.length).toFixed(1) + ' Days'
      : 'N/A';

    res.status(200).json({
      success: true,
      stats: {
        totalComplaints,
        newToday,
        resolvedThisWeek,
        avgResolutionTime,
        complaintsByStatus
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Server error fetching dashboard statistics.' });
  }
};
exports.getLocalityZoneConditions = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Only administrators can view zone conditions.' });
    }

    const localities = await Locality.find({}); // Fetch all locality GeoJSON data
    const twoWeeksAgo = new Date(Date.now() - (14 * 24 * 60 * 60 * 1000));

    // Array to store results
    const localitiesWithZones = [];

    // Iterate over each locality to count complaints within its boundary
    for (const locality of localities) {
      const complaintCount = await Complaint.countDocuments({
        submittedAt: { $gte: twoWeeksAgo },
        location: {
          $geoWithin: {
            $geometry: locality.geometry // Use the actual GeoJSON polygon from the locality
          }
        }
      });

      let zone = 'green'; // Default
      if (complaintCount > 30) { // Example thresholds for Red Zone
        zone = 'red';
      } else if (complaintCount > 10) { // Example thresholds for Orange Zone
        zone = 'orange';
      }

      localitiesWithZones.push({
        type: "Feature",
        geometry: locality.geometry, // Keep the full GeoJSON geometry
        properties: {
          name: locality.name,
          zone: zone,
          complaints: complaintCount,
          // Add any other properties you want to display in popups/info
        },
        _id: locality._id // Include _id for unique keys in frontend map
      });
    }

    const featureCollection = {
      type: "FeatureCollection",
      features: localitiesWithZones
    };

    res.status(200).json({
      success: true,
      data: featureCollection,
      message: 'Locality zone conditions fetched successfully.'
    });

  } catch (error) {
    console.error('Error fetching locality zone conditions:', error);
    res.status(500).json({ success: false, message: 'Server error fetching locality zone conditions.' });
  }
};
exports.getRecentActivity = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Only administrators can view recent activity.' });
    }

    // Fetch the latest 50 complaints sorted by submission or update date
    const complaints = await Complaint.find({})
      .sort({ submittedAt: -1 })
      .limit(50)
      .populate('submittedBy', 'firstName lastName email')
      .populate('updates.updatedBy', 'firstName lastName email');

    const activities = [];

    complaints.forEach(complaint => {
      // Add submittedAt as an activity
      activities.push({
        date: complaint.submittedAt,
        type: 'Submitted',
        description: `Complaint #${complaint._id.toString().slice(-6)} was submitted.`,
        complaintId: complaint._id,
        by: complaint.submittedBy ? `${complaint.submittedBy.firstName} ${complaint.submittedBy.lastName}` : 'User',
      });

      // Add each update as a separate activity
      complaint.updates.forEach(update => {
        activities.push({
          date: update.date,
          type: 'Update',
          description: update.text,
          complaintId: complaint._id,
          by: update.updatedBy ? `${update.updatedBy.firstName} ${update.updatedBy.lastName}` : 'System',
        });
      });
    });

    // Sort all activities by date descending
    const sortedActivities = activities
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 50); // Limit to top 50 most recent

    res.status(200).json({
      success: true,
      message: 'Recent activity fetched successfully.',
      recentActivity: sortedActivities,
    });

  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ success: false, message: 'Server error fetching recent activity.' });
  }
};
exports.getAllUsers = async (req, res) => {
  try {
    // Check if the requester is an admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Only administrators can view all users.' });
    }

    // Fetch all users
    const users = await User.find({})
      .select('_id firstName lastName email phone role createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
      message: 'All users fetched successfully for admin user management.',
    });
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ success: false, message: 'Server error fetching users.' });
  }
};
exports.updateUserDetails = async (req, res) => {
  try {
    const { id } = req.params; 
    const { firstName, lastName, email, phone } = req.body;

    // Only admins can update user details
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Only administrators can update user details.' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Update only provided fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (phone) user.phone = phone;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User details updated successfully!',
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      }
    });

  } catch (error) {
    console.error('Error updating user details:', error);
    res.status(500).json({ success: false, message: 'Server error updating user details.' });
  }
};

// Change a user's role (e.g., user -> admin, user -> NGO)
exports.changeUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { newRole } = req.body;

    const validRoles = ['volunteer', 'ngo', 'admin'];
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Only administrators can change roles.' });
    }

    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ success: false, message: 'Invalid role provided.' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // ✅ Use .equals() for reliable ObjectId comparison
    if (user._id.equals(req.user._id) && newRole !== 'admin') {
      return res.status(400).json({ success: false, message: 'You cannot change your own role to non-admin.' });
    }

    user.role = newRole;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role updated to ${newRole} successfully!`,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error('Error changing user role:', error);
    res.status(500).json({ success: false, message: 'Server error changing user role.' });
  }
};

// Fetch a single user details for Admin View
exports.getSingleUserForAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the requester is an admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Forbidden: Only administrators can view user details.' 
      });
    }

    // Fetch the user by ID
    const user = await User.findById(id)
      .select('_id firstName lastName email phone role createdAt');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found.' 
      });
    }

    res.status(200).json({
      success: true,
      user,
      message: 'User details fetched successfully for admin view.',
    });

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid user ID format.' 
      });
    }
    console.error('Error fetching single user for admin:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching user details.' 
    });
  }
};
// Delete a user by Admin
exports.deleteUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Only admins can delete users
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Forbidden: Only administrators can delete users.' 
      });
    }

    // ✅ Prevent admin from deleting themselves
    if (req.user._id.equals(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'You cannot delete your own account.' 
      });
    }

    // ✅ Find the user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found.' 
      });
    }
    await user.deleteOne();

    res.status(200).json({ 
      success: true, 
      message: `User '${user.firstName || user.email}' deleted successfully.` 
    });

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid user ID format.' 
      });
    }
    console.error('Error deleting user by admin:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error deleting user.' 
    });
  }
};
// Fetch all NGO users (Admin only)
exports.getAllNGOs = async (req, res) => {
  try {
    // ✅ Only admins can fetch NGOs
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Forbidden: Only administrators can view NGO users.' 
      });
    }

    // ✅ Fetch users with role 'ngo'
    const ngos = await User.find({ role: 'ngo' })
      .select('_id firstName lastName email phone role createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: ngos.length,
      ngos,
      message: 'All NGO users fetched successfully.',
    });

  } catch (error) {
    console.error('Error fetching NGO users:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching NGO users.' 
    });
  }
};
exports.getSingleNGOForAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Only administrators can view NGO details.' });
    }

    const ngo = await User.findById(id).select('-password'); // Exclude password
    
    // Crucial: Ensure the found user actually has the 'ngo' role
    if (!ngo || ngo.role !== 'ngo') {
      return res.status(404).json({ success: false, message: 'NGO user not found or invalid role.' });
    }

    res.status(200).json({
      success: true,
      ngo, // Return the NGO user object
      message: 'NGO details fetched successfully for admin view.',
    });

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid NGO ID format.' });
    }
    console.error('Error fetching single NGO for admin:', error);
    res.status(500).json({ success: false, message: 'Server error fetching NGO details.' });
  }
};

// @desc    Update a single NGO user's details by Admin
// @route   PUT /api/admin/ngos/:id
// @access  Private (Admin role)
exports.updateNGODetails = async (req, res) => {
  try {
    const { id } = req.params; // NGO user ID
    const { firstName, lastName, email, phone /*, other NGO specific fields */ } = req.body;

    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Only administrators can update NGO details.' });
    }

    const ngo = await User.findById(id);

    if (!ngo || ngo.role !== 'ngo') { // Ensure the found user is an NGO
      return res.status(404).json({ success: false, message: 'NGO user not found or invalid role.' });
    }

    // You can add more specific validation here (e.g., if you add NGO-specific fields)

    // Update only provided fields
    if (firstName) ngo.firstName = firstName;
    if (lastName) ngo.lastName = lastName;
    if (email) ngo.email = email;
    if (phone) ngo.phone = phone;
    // Update other NGO specific fields here (e.g., ngo.areaOfOperation = areaOfOperation)

    await ngo.save();

    res.status(200).json({
      success: true,
      message: 'NGO details updated successfully!',
      ngo: { // Return updated NGO details
        _id: ngo._id,
        firstName: ngo.firstName,
        lastName: ngo.lastName,
        email: ngo.email,
        phone: ngo.phone,
        role: ngo.role,
        isVerified: ngo.isVerified,
        // Add other NGO specific fields here as well
      }
    });

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid NGO ID format.' });
    }
    console.error('Error updating NGO details:', error);
    res.status(500).json({ success: false, message: 'Server error updating NGO details.' });
  }
};
exports.deleteNGOByAdmin = async (req, res) => {
  try {
    const { id } = req.params; // NGO user ID to delete

    // Check if the requester is an admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Only administrators can delete NGO users.' });
    }

    // Prevent admin from deleting themselves (if they somehow manage to open this modal for their own account)
    if (req.user._id.equals(id)) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account.' });
    }

    // Find the NGO user
    const ngo = await User.findById(id);
    if (!ngo) {
      return res.status(404).json({ success: false, message: 'NGO user not found.' });
    }

    // Crucial: Ensure the user being deleted actually has the 'ngo' role
    if (ngo.role !== 'ngo') {
      return res.status(400).json({ success: false, message: 'Invalid user for this operation. User is not an NGO.' });
    }

    // TODO: Optional: Implement cleanup for complaints assigned to this NGO
    // If you delete an NGO, you might want to:
    // 1. Reassign their complaints to a default admin or mark as unassigned.
    // 2. Or delete complaints submitted/managed by this NGO.
    // For example: await Complaint.updateMany({ assignedTo: ngo._id }, { $set: { assignedTo: null, status: 'Pending' } });

    // Delete the NGO user document
    await ngo.deleteOne();

    res.status(200).json({
      success: true,
      message: `NGO '${ngo.firstName || ngo.email}' deleted successfully.`
    });

  } catch (error) {
    // Handle CastError if ID format is wrong
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid NGO ID format.' });
    }
    console.error('Error deleting NGO by admin:', error);
    res.status(500).json({ success: false, message: 'Server error deleting NGO.' });
  }
};

