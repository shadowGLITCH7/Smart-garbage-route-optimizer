const express = require('express');
const router = express.Router();
const Bin = require('../models/Bin');
const Route = require('../models/Route');
const CollectionLog = require('../models/CollectionLog');
const { optimizeRoute } = require('./optimizer');

const DEPOT = { lat: 23.3441, lon: 85.3096, name: 'Main Depot - Ranchi' };

router.post('/generate', async (req, res) => {
  try {
    const { zone, threshold = 50, truck } = req.body;
    const filter = { status: 'active' };
    if (zone && zone !== 'All') filter.zone = zone;
    const bins = await Bin.find(filter);
    if (!bins.length) return res.status(400).json({ error: 'No active bins found' });

    const result = optimizeRoute(DEPOT, bins, threshold);
    if (!result.route.length) return res.status(400).json({ error: 'No bins above threshold. Lower the fill threshold.' });

    const route = await Route.create({
      routeId: 'R-' + Date.now(),
      truck: truck || 'T-01',
      zone: zone || 'All',
      bins: result.route.map(r => r.bin._id),
      totalDistance: result.totalDistance,
      estimatedDuration: result.estimatedDuration,
      co2Saved: result.co2Saved,
      status: 'pending',
    });

    res.json({
      route,
      optimized: result.route.map(r => ({
        bin: r.bin,
        distFromPrev: r.distFromPrev.toFixed(2),
      })),
      summary: {
        collected: result.collected,
        skipped: result.skipped,
        totalDistance: result.totalDistance,
        estimatedDuration: result.estimatedDuration,
        co2Saved: result.co2Saved,
        truck: truck || 'T-01',
        depot: DEPOT,
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all routes — includes pending ones for history page
router.get('/', async (req, res) => {
  try {
    const routes = await Route.find().populate('bins').sort({ createdAt: -1 }).limit(50);
    res.json(routes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single route
router.get('/:id', async (req, res) => {
  try {
    const route = await Route.findById(req.params.id).populate('bins');
    if (!route) return res.status(404).json({ error: 'Route not found' });
    res.json(route);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH mark route as in-progress
router.patch('/:id/start', async (req, res) => {
  try {
    const route = await Route.findByIdAndUpdate(req.params.id, { status: 'in-progress' }, { new: true });
    res.json({ success: true, route });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH complete route
router.patch('/:id/complete', async (req, res) => {
  try {
    const route = await Route.findById(req.params.id).populate('bins');
    if (!route) return res.status(404).json({ error: 'Route not found' });

    for (const bin of route.bins) {
      await CollectionLog.create({
        binId: bin._id, binCode: bin.binId,
        fillLevelAtCollection: bin.fillLevel,
        truckId: route.truck, zone: bin.zone,
      });
      bin.fillLevel = 0;
      bin.lastCollected = new Date();
      await bin.save();
    }

    route.status = 'completed';
    route.completedAt = new Date();
    await route.save();
    res.json({ success: true, route });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE route
router.delete('/:id', async (req, res) => {
  try {
    await Route.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET collection logs
router.get('/logs/all', async (req, res) => {
  try {
    const logs = await CollectionLog.find().sort({ collectedAt: -1 }).limit(50);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET analytics
router.get('/analytics/summary', async (req, res) => {
  try {
    const routes = await Route.find({ status: 'completed' });
    const logs = await CollectionLog.find();
    const totalDistance = routes.reduce((s,r) => s+r.totalDistance, 0);
    const totalCo2Saved = routes.reduce((s,r) => s+r.co2Saved, 0);
    const byZone = {};
    logs.forEach(l => { if (!byZone[l.zone]) byZone[l.zone]=0; byZone[l.zone]++; });
    res.json({
      totalRoutes: routes.length,
      totalDistance: totalDistance.toFixed(1),
      totalCo2Saved: totalCo2Saved.toFixed(1),
      totalCollections: logs.length,
      byZone,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
