// src/backend/models/Announcement.js

const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Announcement title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters long'],
  },
  content: {
    type: String,
    required: [true, 'Announcement content is required'],
    minlength: [10, 'Content must be at least 10 characters long'],
  },
  type: {
    type: String,
    enum: ['alert', 'news', 'event', 'general'], // Type of announcement
    default: 'general',
  },
  locality: { // Specific locality this announcement is relevant to (e.g., Koramangala, Jayanagar)
    type: String,
    trim: true,
    // Not required, as some announcements might be city-wide
  },
  region: { // Broader region/city if not specific to a locality
    type: String,
    trim: true,
    default: 'Bengaluru', // Default to Bengaluru as current city
  },
  publishedAt: {
    type: Date,
    default: Date.now,
  },
  // Optional: User who published the announcement (e.g., Admin)
  publishedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'user', // Reference to your User model (Admin role)
    default: null,
  },
}, { timestamps: true }); // Adds createdAt and updatedAt timestamps automatically

const Announcement = mongoose.model('Announcement', announcementSchema);

module.exports = Announcement;