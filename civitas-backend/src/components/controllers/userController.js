const User = require('../../models/user');
const Complaint = require('../../models/Complaint'); 
exports.getUserProfile = async (req, res) => {
    try {
        const fetchedUser = await User.findById(req.user.id).select('-password');
        if (!fetchedUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, user: fetchedUser });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ success: false, message: 'Server error fetching user profile' });
    }
};
exports.updateProfile = async (req, res) => {
    const { firstName, lastName, email, phone } = req.body;

    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        if (email && email !== user.email) {
            const existingUserWithEmail = await User.findOne({ email });
            if (existingUserWithEmail) {
                return res.status(400).json({ success: false, message: 'Email already in use by another account.' });
            }
        }
        
        if (phone && phone !== user.phone && !user.googleId) {
            const existingUserWithPhone = await User.findOne({ phone });
            if (existingUserWithPhone) {
                return res.status(400).json({ success: false, message: 'Phone number already in use by another account.' });
            }
        }

        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.email = email || user.email;
        user.phone = phone || user.phone;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully!',
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isVerified: user.isVerified
            }
        });

    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        console.error('Error updating user profile:', error);
        res.status(500).json({ success: false, message: 'Server error updating profile.' });
    }
};
exports.deleteProfile = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized, please log in.' });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        await user.deleteOne();

        res.status(200).json({ success: true, message: 'Profile deleted successfully.' });

    } catch (error) {
        console.error('Error deleting user profile:', error);
        res.status(500).json({ success: false, message: 'Server error deleting profile.' });
    }
};
exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Complaint.aggregate([
      {
        $match: {
          status: 'Resolved'
        }
      },
      {
        $group: {
          _id: '$submittedBy',
          resolvedComplaints: { $sum: 1 } 
        }
      },
      {
        $lookup: {
          from: 'users', 
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $unwind: '$userDetails'
      },
      {
        $project: {
          _id: 0, 
          userId: '$userDetails._id',
          firstName: '$userDetails.firstName',
          lastName: '$userDetails.lastName',
          email: '$userDetails.email',
          resolvedComplaints: 1 
        }
      },
      {
        $sort: { resolvedComplaints: -1 }
      },
      {
                $limit: 10
      }
    ]);

    res.status(200).json({
      success: true,
      count: leaderboard.length,
      leaderboard,
      message: 'Leaderboard fetched successfully.'
    });

  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ success: false, message: 'Server error fetching leaderboard.' });
  }
};
exports.getAssignees = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Only administrators can fetch assignee lists.' });
    }

    const { role } = req.query; 

    let query = {};
    if (role) {
        query.role = role; 
    } else {
        query.$or = [{ role: 'ngo' }, { role: 'admin' }];
    }

    const assignees = await User.find(query).select('_id firstName lastName email role');

    res.status(200).json({
      success: true,
      count: assignees.length,
      assignees,
      message: 'Assignees fetched successfully.'
    });

  } catch (error) {
    console.error('Error fetching assignees:', error);
    res.status(500).json({ success: false, message: 'Server error fetching assignees.' });
  }
};