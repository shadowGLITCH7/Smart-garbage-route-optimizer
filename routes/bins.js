const express = require('express');
const router = express.Router();
const Bin = require('../models/Bin');
const CollectionLog = require('../models/CollectionLog');

// GET all bins
router.get('/', async (req, res) => {
  try {
    const { zone, status, type, minFill } = req.query;
    const filter = {};
    if (zone) filter.zone = zone;
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (minFill) filter.fillLevel = { $gte: parseInt(minFill) };
    const bins = await Bin.find(filter).sort({ fillLevel: -1 });
    res.json(bins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single bin
router.get('/:id', async (req, res) => {
  try {
    const bin = await Bin.findById(req.params.id);
    if (!bin) return res.status(404).json({ error: 'Bin not found' });
    res.json(bin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create bin
router.post('/', async (req, res) => {
  try {
    const bin = new Bin(req.body);
    await bin.save();
    res.status(201).json(bin);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH update fill level
router.patch('/:id/fill', async (req, res) => {
  try {
    const { fillLevel } = req.body;
    const bin = await Bin.findByIdAndUpdate(
      req.params.id,
      { fillLevel },
      { new: true }
    );
    res.json(bin);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST collect a bin (reset fill level)
router.post('/:id/collect', async (req, res) => {
  try {
    const bin = await Bin.findById(req.params.id);
    if (!bin) return res.status(404).json({ error: 'Bin not found' });

    await CollectionLog.create({
      binId: bin._id,
      binCode: bin.binId,
      fillLevelAtCollection: bin.fillLevel,
      truckId: req.body.truckId || 'T-01',
      zone: bin.zone,
    });

    bin.fillLevel = 0;
    bin.lastCollected = new Date();
    await bin.save();
    res.json({ success: true, bin });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE bin
router.delete('/:id', async (req, res) => {
  try {
    await Bin.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET stats summary
router.get('/stats/summary', async (req, res) => {
  try {
    const bins = await Bin.find();
    const total = bins.length;
    const critical = bins.filter(b => b.fillLevel >= 80).length;
    const moderate = bins.filter(b => b.fillLevel >= 50 && b.fillLevel < 80).length;
    const low = bins.filter(b => b.fillLevel < 50).length;
    const avgFill = total ? (bins.reduce((s, b) => s + b.fillLevel, 0) / total).toFixed(1) : 0;

    const zones = {};
    bins.forEach(b => {
      if (!zones[b.zone]) zones[b.zone] = { total: 0, critical: 0, avgFill: 0, fillSum: 0 };
      zones[b.zone].total++;
      zones[b.zone].fillSum += b.fillLevel;
      if (b.fillLevel >= 80) zones[b.zone].critical++;
    });
    Object.keys(zones).forEach(z => {
      zones[z].avgFill = (zones[z].fillSum / zones[z].total).toFixed(1);
      delete zones[z].fillSum;
    });

    res.json({ total, critical, moderate, low, avgFill, zones });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
