const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  category: {
    type: String,
    required: [true, 'Complaint category is required'],
    enum: [
      'Sanitation & Waste',
      'Drainage & Water',
      'Electrical & Lighting',
      'Road & Infrastructure',
      'Animal Safety / Nuisance',
      'Public Safety',
    ], 
  },
  subType: {
    type: String,
    required: [true, 'Complaint sub-type is required'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: [10, 'Description must be at least 10 characters long'],
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
  },
  location: { 
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: { 
      type: [Number],
      required: [true, 'Coordinates are required'],
      index: '2dsphere', 
    },
  },
  photo: {
    type: String,
    required: [true, 'Photo is required'],
  },
  severity: {
    type: String,
    enum: ['low', 'moderate', 'high', 'urgent'],
    default: 'moderate',
  },
  status: {
    type: String,
    enum: ['Pending', 'Process Ongoing', 'Resolved', 'Rejected'],
    default: 'Pending',
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  reraisedCount: {
    type: Number,
    default: 0,
  },
  submittedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'user', 
    required: true,
  },
  assignedTo: {
    type: mongoose.Schema.ObjectId,
    ref: 'user',
    default: null,
  },

  updates: [
    {
      date: {
        type: Date,
        default: Date.now,
      },
      text: String,
      updatedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'user',
      },
    },
  ],
  supportedBy: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'user',
    },
  ],
  feedbackRating: {
    type: Number,
    min: 1,
    max: 5,
  },
  feedbackComment: String,
  feedbackSubmittedAt: Date,

  beforeAfterPhotos: [
    {
      url: String,
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
      uploadedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'user',
      },
    },
  ],

}, { timestamps: true }); 

const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint;