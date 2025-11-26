const Complaint = require('../../models/Complaint');
const User = require('../../models/user');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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
  limits: { fileSize: 1024 * 1024 * 5 },
});

exports.createComplaint = async (req, res) => {
  try {
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
    const message = process.env.NODE_ENV === 'development' ? error.message || 'Server error during complaint submission.' : 'Server error during complaint submission.';
    res.status(500).json({ success: false, message });
  }
};

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

    res.status(200).json({ success: true, message: 'Complaint reraised successfully!', complaint });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error during complaint reraise.' });
  }
};

exports.getCityComplaintStats = async (req, res) => {
  try {
    const twoWeeksAgo = new Date(Date.now() - (14 * 24 * 60 * 60 * 1000));

    const stats = await Complaint.aggregate([
      { $match: { submittedAt: { $gte: twoWeeksAgo } } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $project: { _id: 0, category: "$_id", count: 1 } },
      { $sort: { count: -1 } }
    ]);

    const labels = stats.map(s => s.category);
    const data = stats.map(s => s.count);

    res.status(200).json({
      success: true,
      stats: { labels, data },
      message: 'City-wide complaint statistics fetched successfully.'
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching city statistics.' });
  }
};

exports.getLocalComplaints = async (req, res) => {
  try {
    const { lat, lon, radius = 5 } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ success: false, message: 'Latitude and longitude are required for local complaints.' });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    const radiusInMeters = parseFloat(radius) * 1000;

    const twoWeeksAgo = new Date(Date.now() - (14 * 24 * 60 * 60 * 1000));

    const complaints = await Complaint.find({
      location: {
        $nearSphere: {
          $geometry: { type: "Point", coordinates: [longitude, latitude] },
          $maxDistance: radiusInMeters
        }
      },
      submittedAt: { $gte: twoWeeksAgo }
    }).sort({ submittedAt: -1 });

    return res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
      message: `Local complaints within ${radius}km fetched successfully.`
    });

  } catch (error) {
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
    res.status(500).json({ success: false, message: 'Server error while supporting complaint.' });
  }
};

exports.getSimilarComplaints = async (req, res) => {
  try {
    const lat = req.query.lat;
    const lon = req.query.lon;
    const category = req.query.category;
    const description = req.query.description || req.query.desc;
    const userId = req.user && req.user.id;

    if (!lat || !lon || !category || !description) {
      return res.status(400).json({ success: false, message: 'Location, category, and description are required to find similar complaints.' });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    const radiusInMeters = 200;
    const twoWeeksAgo = new Date(Date.now() - (14 * 24 * 60 * 60 * 1000));

    let query = {
      location: {
        $nearSphere: {
          $geometry: { type: "Point", coordinates: [longitude, latitude] },
          $maxDistance: radiusInMeters
        }
      },
      status: { $nin: ['Resolved', 'Rejected'] },
      submittedAt: { $gte: twoWeeksAgo },
      submittedBy: { $ne: userId }
    };

    if (category) query.category = category;

    if (description) {
      const keywords = description.split(' ').map(word => new RegExp(word, 'i'));
      query.description = { $in: keywords };
    }

    const similarComplaints = await Complaint.find(query)
      .sort({ supportedBy: -1, submittedAt: -1 })
      .limit(5)
      .select('category subType description status supportedBy submittedAt');

    const formattedSimilarComplaints = similarComplaints.map(complaint => ({
      _id: complaint._id,
      category: complaint.category,
      subType: complaint.subType,
      description: complaint.description,
      status: complaint.status,
      supportedCount: complaint.supportedBy.length,
      userSupported: complaint.supportedBy.includes(userId),
      submittedAt: complaint.submittedAt,
    }));

    res.status(200).json({
      success: true,
      count: formattedSimilarComplaints.length,
      similarComplaints: formattedSimilarComplaints,
      similar: formattedSimilarComplaints,
      message: 'Similar complaints fetched successfully.'
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching similar complaints.' });
  }
};

exports.ngoResolveComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolutionNote } = req.body;

    if (!req.user || req.user.role !== 'ngo') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    if (!complaint.assignedTo || complaint.assignedTo.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    if (complaint.status === 'Resolved' || complaint.status === 'Rejected') {
      return res.status(400).json({ success: false, message: `Complaint is already ${complaint.status}.` });
    }

    let photoUrl = null;
    if (req.file) {
      photoUrl = req.file.filename;
      complaint.beforeAfterPhotos.push({
        url: photoUrl,
        uploadedBy: req.user.id,
        uploadedAt: new Date(),
      });
    }

    if (resolutionNote && typeof resolutionNote === 'string' && resolutionNote.trim() !== '') {
      complaint.updates.push({
        date: new Date(),
        text: `NGO Report: ${resolutionNote.trim()}`,
        updatedBy: req.user.id,
      });
    } else if (!req.file) {
      return res.status(400).json({ success: false, message: 'Resolution update requires either a photo or a note.' });
    }

    complaint.status = 'Process Ongoing';
    await complaint.save();

    res.status(200).json({
      success: true,
      message: 'Resolution update submitted successfully!',
      complaint: {
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
    res.status(500).json({ success: false, message: 'Server error during NGO resolution update.' });
  }
};

exports.getSingleComplaintForNgo = async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findById(id)
      .select('category subType description address photo severity status submittedAt assignedTo')
      .populate('submittedBy', 'firstName lastName')
      .populate('assignedTo', 'firstName lastName email');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    res.status(200).json({
      success: true,
      complaint,
      message: 'Complaint details fetched successfully for NGO resolution.'
    });

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid complaint ID format.' });
    }
    res.status(500).json({ success: false, message: 'Server error fetching complaint details for NGO resolution.' });
  }
};

exports.uploadMiddlewareNGOResolutionPhoto = uploadNGOResolutionPhoto.single('resolutionPhoto');
