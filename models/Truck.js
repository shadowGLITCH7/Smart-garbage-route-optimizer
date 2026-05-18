const mongoose = require('mongoose');

const truckSchema = new mongoose.Schema({
  truckId:  { type: String, required: true, unique: true },
  driver:   { type: String, required: true },
  phone:    { type: String, default: '' },
  capacity: { type: Number, default: 5000 },
  status:   { type: String, enum: ['available', 'on-route', 'maintenance'], default: 'available' },
  zone:     { type: String, default: 'All' },
}, { timestamps: true });

module.exports = mongoose.model('Truck', truckSchema);
