const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  binId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bin' },
  binCode: String,
  fillLevelAtCollection: Number,
  truckId: String,
  collectedAt: { type: Date, default: Date.now },
  zone: String,
});

module.exports = mongoose.model('CollectionLog', logSchema);
