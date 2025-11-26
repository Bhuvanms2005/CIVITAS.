const Complaint = require('../../models/Complaint');
const User = require('../../models/user');
const multer = require('multer');
const path = require('path');
const fs=require('fs');

// Ensure uploads directory is the same as backend's uploads folder
const uploadsDir = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed!'), false);
  }
};
const uploadNGOResolutionPhoto = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5, 
  },
});
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 10,
  },
});

exports.createComplaint = async (req, res) => {
  try {
    // Diagnostic logs to aid debugging when clients hit server errors
    console.log('createComplaint called. user:', req.user ? req.user.id : null);
    console.log('createComplaint req.body:', req.body);
    console.log('createComplaint req.file:', req.file);

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Photo is required for the complaint.' });
    }

    const { category, subType, description, address, latitude, longitude, severity } = req.body;

    if (!req.user || !req.user.id) {
        return res.status(401).json({ success: false, message: 'Not authorized, user not found.' });
    }

    const complaint = new Complaint({
      category,
      subType,
      description,
      address,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
      photo: `uploads/${req.file.filename}`,
      severity,
      submittedBy: req.user.id,
    });

    await complaint.save();

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully!',
      complaint,
    });

  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    console.error('Error creating complaint:', error);
    // In development return the error message to client for faster debugging
    const message = process.env.NODE_ENV === 'development' ? error.message || 'Server error during complaint submission.' : 'Server error during complaint submission.';
    res.status(500).json({ success: false, message });
  }
};

exports.uploadComplaintPhoto = upload.single('photo');

exports.getMyComplaints = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized, please log in.' });
    }

    const complaints = await Complaint.find({ submittedBy: req.user.id }).sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });

  } catch (error) {
    console.error('Error fetching user complaints:', error);
    res.status(500).json({ success: false, message: 'Server error fetching your complaints.' });
  }
};

exports.reraiseComplaint = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized, please log in.' });
    }

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    if (complaint.submittedBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to reraise this complaint.' });
    }

    if (complaint.status === 'Resolved' || complaint.status === 'Rejected') {
      return res.status(400).json({ success: false, message: `Complaint cannot be reraised. Current status: ${complaint.status}.` });
    }

    complaint.reraisedCount += 1;
    complaint.updates.push({
      date: new Date(),
      text: `Complaint reraised by user (Count: ${complaint.reraisedCount}).`,
      updatedBy: req.user.id,
    });

    await complaint.save();

    console.log(`Complaint ${id} reraised. Notifying admin/NGO...`);

    res.status(200).json({ success: true, message: 'Complaint reraised successfully!', complaint });

  } catch (error) {
    console.error('Error reraising complaint:', error);
    res.status(500).json({ success: false, message: 'Server error during complaint reraise.' });
  }
};

exports.getCityComplaintStats = async (req, res) => {
  try {
    const twoWeeksAgo = new Date(Date.now() - (14 * 24 * 60 * 60 * 1000));

    const stats = await Complaint.aggregate([
      {
        $match: {
          submittedAt: { $gte: twoWeeksAgo }
        }
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          count: 1
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const labels = stats.map(s => s.category);
    const data = stats.map(s => s.count);

    res.status(200).json({
      success: true,
      stats: { labels, data },
      message: 'City-wide complaint statistics fetched successfully.'
    });

  } catch (error) {
    console.error('Error fetching city complaint stats:', error);
    res.status(500).json({ success: false, message: 'Server error fetching city statistics.' });
  }
};


exports.getLocalComplaints = async (req, res) => {
  try {
    const { lat, lon, radius = 5 } = req.query; // Default radius of 5 km

    if (!lat || !lon) {
      return res.status(400).json({ success: false, message: 'Latitude and longitude are required for local complaints.' });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    const radiusInMeters = parseFloat(radius) * 1000; // Convert km to meters

    const twoWeeksAgo = new Date(Date.now() - (14 * 24 * 60 * 60 * 1000));

    const complaints = await Complaint.find({
      location: {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude] // [longitude, latitude] for GeoJSON Point
          },
          $maxDistance: radiusInMeters // Max distance in meters
        }
      },
      submittedAt: { $gte: twoWeeksAgo }
    }).sort({ submittedAt: -1 }); // Sort by most recent

    return res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
      message: `Local complaints within ${radius}km fetched successfully.`
    });

  } catch (error) {
    console.error('Error fetching local complaints:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching local complaints.' });
  }
};

exports.supportComplaint = async (req, res) => {
  try {
    const complaintId = req.params.id;
    const userId = req.user.id;

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    // Avoid duplicate support
    if (complaint.supportedBy.includes(userId)) {
      return res.status(400).json({ success: false, message: 'You have already supported this complaint.' });
    }

    complaint.supportedBy.push(userId);
    await complaint.save();

    res.status(200).json({
      success: true,
      message: 'Complaint supported successfully.',
      supportCount: complaint.supportedBy.length
    });
  } catch (error) {
    console.error('Error supporting complaint:', error);
    res.status(500).json({ success: false, message: 'Server error while supporting complaint.' });
  }
};



// @desc    Get similar complaints based on location, category, and keywords
// @route   GET /api/complaints/similar?lat=<lat>&lon=<lon>&category=<category>&description=<keywords>
// @access  Private (used by ComplaintForm)
exports.getSimilarComplaints = async (req, res) => {
  try {
    // Accept both `description` and `desc` query params for compatibility with frontend
    const lat = req.query.lat;
    const lon = req.query.lon;
    const category = req.query.category;
    const description = req.query.description || req.query.desc;
    const userId = req.user && req.user.id; // User making the request

    if (!lat || !lon || !category || !description) {
      return res.status(400).json({ success: false, message: 'Location (lat, lon), category, and description/desc query parameters are required to find similar complaints.' });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    const radiusInMeters = 200; // Search within 200 meters for 'similar' complaints (can be a parameter)
    const twoWeeksAgo = new Date(Date.now() - (14 * 24 * 60 * 60 * 1000));

    let query = {
      // 1. Geographical proximity (e.g., within 200m radius)
      location: {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude]
          },
          $maxDistance: radiusInMeters
        }
      },
      // 2. Status is not Resolved or Rejected
      status: { $nin: ['Resolved', 'Rejected'] },
      // 3. Submitted within the last 2 weeks (or recent)
      submittedAt: { $gte: twoWeeksAgo },
      // 4. Exclude complaints submitted by the current user (optional, but good for "support other's")
      submittedBy: { $ne: userId } // Don't show your own complaints as "similar" to support
    };

    // 5. Filter by category (strict match)
    if (category) {
      query.category = category;
    }

    // 6. Filter by description keywords (using regex for partial match, case-insensitive)
    if (description) {
      const keywords = description.split(' ').map(word => new RegExp(word, 'i')); // Case-insensitive, partial match
      query.description = { $in: keywords }; // Match if description contains any of the keywords
    }

    const similarComplaints = await Complaint.find(query)
      .sort({ supportedBy: -1, submittedAt: -1 }) // Prioritize complaints with more support, then recent
      .limit(5) // Limit to top 5 similar complaints
      .select('category subType description status supportedBy submittedAt'); // Select only necessary fields

    // Add a 'supportedCount' and 'userSupported' flag for frontend display
    const formattedSimilarComplaints = similarComplaints.map(complaint => ({
      _id: complaint._id,
      category: complaint.category,
      subType: complaint.subType,
      description: complaint.description,
      status: complaint.status,
      supportedCount: complaint.supportedBy.length,
      userSupported: complaint.supportedBy.includes(userId), // Check if current user has supported
      submittedAt: complaint.submittedAt,
    }));

    res.status(200).json({
      success: true,
      count: formattedSimilarComplaints.length,
      similarComplaints: formattedSimilarComplaints,
      // keep backwards-compatible alias expected by some frontend code
      similar: formattedSimilarComplaints,
      message: 'Similar complaints fetched successfully.'
    });

  } catch (error) {
    console.error('Error fetching similar complaints:', error);
    res.status(500).json({ success: false, message: 'Server error fetching similar complaints.' });
  }
};
exports.ngoResolveComplaint = async (req, res) => {
  try {
    const { id } = req.params; // Complaint ID
    const { resolutionNote } = req.body; // Optional resolution note from NGO

    // Ensure user is authenticated and has 'ngo' role (or appropriate role for resolution)
    if (!req.user || req.user.role !== 'ngo') {
      return res.status(403).json({ success: false, message: 'Forbidden: Only assigned NGOs can submit resolution updates.' });
    }

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    // Crucial: Check if the complaint is actually assigned to this NGO
    if (!complaint.assignedTo || complaint.assignedTo.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden: Complaint not assigned to your organization.' });
    }

    // Check if complaint is already resolved/rejected
    if (complaint.status === 'Resolved' || complaint.status === 'Rejected') {
      return res.status(400).json({ success: false, message: `Complaint is already ${complaint.status}. Cannot update resolution.` });
    }

    // Add photo to beforeAfterPhotos if uploaded
    let photoUrl = null;
    if (req.file) {
      photoUrl = req.file.filename;
      complaint.beforeAfterPhotos.push({
        url: photoUrl,
        uploadedBy: req.user.id, // NGO who submitted the photo
        uploadedAt: new Date(),
      });
    }

    // Add resolution note to updates history
    if (resolutionNote && typeof resolutionNote === 'string' && resolutionNote.trim() !== '') {
        complaint.updates.push({
            date: new Date(),
            text: `NGO Report: ${resolutionNote.trim()}`,
            updatedBy: req.user.id, // NGO who added the note
        });
    } else if (!req.file) { // If no note AND no photo, it's an empty submission
        return res.status(400).json({ success: false, message: 'Resolution update requires either a photo or a note.' });
    }

    // Optional: Flag for Admin review, but status remains 'Process Ongoing'
    // Admin will manually change to 'Resolved' after review.
    complaint.status = 'Process Ongoing'; // Keep or set to "Process Ongoing" to indicate NGO has worked on it
                                          // or add a new status like 'Ready for Review'

    await complaint.save();

    // TODO: Implement notification to Admin that NGO has submitted a resolution update
    console.log(`Complaint ${id} resolution updated by NGO ${req.user.email}. Ready for Admin review.`);


    res.status(200).json({
      success: true,
      message: 'Resolution update submitted successfully! Admin will review and change status.',
      complaint: { // Return updated complaint relevant for NGO
        _id: complaint._id,
        status: complaint.status,
        beforeAfterPhotos: complaint.beforeAfterPhotos,
        updates: complaint.updates,
      }
    });

  } catch (error) {
    if (error instanceof multer.MulterError) {
        return res.status(400).json({ success: false, message: error.message });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid complaint ID format.' });
    }
    console.error('Error in NGO resolution update:', error);
    res.status(500).json({ success: false, message: 'Server error during NGO resolution update.' });
  }
};
exports.getSingleComplaintForNgo = async (req, res) => {
  try {
    const { id } = req.params; // Complaint ID from URL parameter

    // For a truly public-facing form via email link, you might:
    // 1. Generate a temporary, unique token when assigning to an NGO and include it in the email link.
    // 2. Verify that token here.
    // For simplicity of initial implementation, we'll fetch basic details without
    // a full JWT 'protect' middleware, but it's important to understand the security implications.
    // The NGO_Complaint_Resolution_Form.jsx will include the JWT from the query string.

    const complaint = await Complaint.findById(id)
      .select('category subType description address photo severity status submittedAt assignedTo') // Select only non-sensitive details
      .populate('submittedBy', 'firstName lastName') // Get submitter's name
      .populate('assignedTo', 'firstName lastName email'); // Get assigned NGO's details


    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    // Optional: Add a check if the complaint is actually assigned to an NGO
    // and if the token in the query string matches the assigned NGO's token (more advanced)

    res.status(200).json({
      success: true,
      complaint, // Return the complaint object
      message: 'Complaint details fetched successfully for NGO resolution.'
    });

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid complaint ID format.' });
    }
    console.error('Error fetching single complaint for NGO resolution:', error);
    res.status(500).json({ success: false, message: 'Server error fetching complaint details for NGO resolution.' });
  }
};

exports.uploadMiddlewareNGOResolutionPhoto = uploadNGOResolutionPhoto.single('resolutionPhoto'); 