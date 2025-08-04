const Announcement = require('../../models/Announcement');
const User = require('../../models/user'); 
exports.getAnnouncements = async (req, res) => {
  try {
    // req.user.id is populated by the 'protect' middleware
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized, please log in.' });
    }

    const { locality, type, limit = 5 } = req.query; // Default limit of 5 announcements

    let query = {
        // Filter by region if you want announcements specific to Bengaluru, etc.
        // For now, let's assume it fetches from the user's general region or all general announcements.
        // Based on plan, announcements are 'relevant to the user's locality'.
        // We will add logic here to filter by user's locality if available, or by general region.
    };

    if (locality) {
        query.locality = locality; // Filter by specific locality if provided
    } else {
        // If no specific locality is requested, you might fetch general announcements
        // or announcements for the user's registered locality (if stored in User model)
        // For simplicity, we'll fetch all general/regional if no specific locality is given.
        query.$or = [{ locality: { $exists: false } }, { locality: null }, { locality: "" }, { region: "Bengaluru" }]; // Example
    }

    if (type) {
        query.type = type; // Filter by announcement type (alert, news, etc.)
    }
    
    const announcements = await Announcement.find(query)
      .sort({ publishedAt: -1 }) // Sort by most recent
      .limit(parseInt(limit)); // Limit the number of results

    res.status(200).json({
      success: true,
      count: announcements.length,
      announcements,
      message: 'Announcements fetched successfully.'
    });

  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ success: false, message: 'Server error fetching announcements.' });
  }
};
exports.createAnnouncement = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Only administrators can create announcements.' });
    }

    const { title, content, type, locality, region } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required for an announcement.' });
    }

    const newAnnouncement = new Announcement({
      title,
      content,
      type: type || 'general', // Default to 'general' if not provided
      locality: locality || '', // Empty string if not provided
      region: region || 'Bengaluru', // Default to Bengaluru
      publishedBy: req.user.id,
      publishedAt: new Date(),
    });

    await newAnnouncement.save();

    res.status(201).json({
      success: true,
      message: 'Announcement created successfully!',
      announcement: newAnnouncement,
    });

  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    console.error('Error creating announcement:', error);
    res.status(500).json({ success: false, message: 'Server error creating announcement.' });
  }
};


// @desc    Update an existing announcement
// @route   PUT /api/admin/announcements/:id
// @access  Private (Admin role)
exports.updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params; // Announcement ID
    const { title, content, type, locality, region } = req.body;

    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Only administrators can update announcements.' });
    }

    const announcement = await Announcement.findById(id);

    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }

    // Update fields if provided
    if (title) announcement.title = title;
    if (content) announcement.content = content;
    if (type) announcement.type = type;
    // Allow clearing locality/region if empty string is sent
    announcement.locality = locality !== undefined ? locality : announcement.locality;
    announcement.region = region !== undefined ? region : announcement.region;

    // updatedAt timestamp will be auto-updated by {timestamps: true}

    await announcement.save();

    res.status(200).json({
      success: true,
      message: 'Announcement updated successfully!',
      announcement,
    });

  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    if (error.name === 'CastError') {
        return res.status(400).json({ success: false, message: 'Invalid announcement ID format.' });
    }
    console.error('Error updating announcement:', error);
    res.status(500).json({ success: false, message: 'Server error updating announcement.' });
  }
};


// @desc    Delete an announcement
// @route   DELETE /api/admin/announcements/:id
// @access  Private (Admin role)
exports.deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params; // Announcement ID

    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Only administrators can delete announcements.' });
    }

    const announcement = await Announcement.findById(id);

    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }

    await announcement.deleteOne(); // Use deleteOne() for Mongoose v5+

    res.status(200).json({ success: true, message: 'Announcement deleted successfully!' });

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid announcement ID format.' });
    }
    console.error('Error deleting announcement:', error);
    res.status(500).json({ success: false, message: 'Server error deleting announcement.' });
  }
};
exports.getSingleAnnouncementForAdmin = async (req, res) => {
  try {
    const { id } = req.params; // Announcement ID from URL parameter

    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Only administrators can view announcement details.' });
    }

    const announcement = await Announcement.findById(id).populate('publishedBy', 'firstName lastName email'); // Populate who published it

    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }

    res.status(200).json({
      success: true,
      announcement, // Return the announcement object
      message: 'Announcement details fetched successfully.',
    });

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid announcement ID format.' });
    }
    console.error('Error fetching single announcement for admin:', error);
    res.status(500).json({ success: false, message: 'Server error fetching announcement details.' });
  }
};