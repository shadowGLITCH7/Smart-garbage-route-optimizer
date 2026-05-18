const express = require('express');
const router = express.Router();
const Truck = require('../models/Truck');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  const trucks = await Truck.find().sort({ createdAt: -1 });
  res.json(trucks);
});

router.post('/', auth, async (req, res) => {
  try {
    const truck = await Truck.create(req.body);
    res.status(201).json(truck);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch('/:id', auth, async (req, res) => {
  try {
    const truck = await Truck.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(truck);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  await Truck.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
