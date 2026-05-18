const mongoose = require('mongoose');

const binSchema = new mongoose.Schema({
  binId: { type: String, required: true, unique: true },
  location: {
    lat: { type: Number, required: true },
    lon: { type: Number, required: true },
    address: { type: String, required: true },
  },
  zone: { type: String, required: true },
  capacity: { type: Number, default: 100 },
  fillLevel: { type: Number, default: 0, min: 0, max: 100 },
  lastCollected: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'maintenance', 'offline'], default: 'active' },
  type: { type: String, enum: ['general', 'recyclable', 'organic'], default: 'general' },
}, { timestamps: true });

module.exports = mongoose.model('Bin', binSchema);
