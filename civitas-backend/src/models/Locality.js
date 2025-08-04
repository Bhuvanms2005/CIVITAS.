const mongoose = require('mongoose');

const localitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Locality name is required'],
    unique: true,
    trim: true,
  },
  geometry: {
    type: {
      type: String,
      enum: ['Polygon'], 
      required: true,
    },
    coordinates: {
      type: [[[Number]]], 
      required: true,
    },
  },
  locIndex: { 
    type: {
      type: String,
      enum: ['Polygon'],
      required: true,
    },
    coordinates: {
      type: [[[Number]]],
      required: true,
    },
  },
}, { timestamps: true });

localitySchema.index({ geometry: '2dsphere' }); 

const Locality = mongoose.model('Locality', localitySchema);

module.exports = Locality;