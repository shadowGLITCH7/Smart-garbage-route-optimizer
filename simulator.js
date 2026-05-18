require('dotenv').config();
const mongoose = require('mongoose');
const Bin = require('./models/Bin');

async function simulate() {
  const bins = await Bin.find({ status: 'active' });
  for (const bin of bins) {
    // Bins fill at different rates based on type
    const rates = { general: [2, 8], recyclable: [1, 4], organic: [3, 10] };
    const [min, max] = rates[bin.type] || [2, 8];
    const increase = Math.random() * (max - min) + min;
    bin.fillLevel = Math.min(100, parseFloat((bin.fillLevel + increase).toFixed(1)));
    await bin.save();
  }
  console.log(`[${new Date().toLocaleTimeString()}] Simulated fill update for ${bins.length} bins`);
}

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('🔄 IoT Simulator started — updating bins every 30 seconds');
  await simulate();
  setInterval(simulate, 30000);
});
