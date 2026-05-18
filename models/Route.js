const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  routeId: { type: String, required: true, unique: true },
  date: { type: Date, default: Date.now },
  truck: { type: String, required: true },
  zone: { type: String, required: true },
  bins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bin' }],
  totalDistance: { type: Number, default: 0 },
  estimatedDuration: { type: Number, default: 0 }, // minutes
  co2Saved: { type: Number, default: 0 },          // kg
  status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
  completedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Route', routeSchema);
