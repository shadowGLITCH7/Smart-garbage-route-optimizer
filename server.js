require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cron = require('node-cron');
const path = require('path');
const cookieParser = require('cookie-parser');

const binRoutes   = require('./routes/bins');
const routeRoutes = require('./routes/routeApi');
const authRoutes  = require('./routes/auth');
const truckRoutes = require('./routes/trucks');
const authMiddleware = require('./middleware/auth');
const Bin = require('./models/Bin');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('DB Error:', err));

// Public API
app.use('/api/auth', authRoutes);

// Protected API
app.use('/api/bins',   authMiddleware, binRoutes);
app.use('/api/routes', authMiddleware, routeRoutes);
app.use('/api/trucks', truckRoutes);

// SSE — live bin updates
app.get('/api/stream', authMiddleware, (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
  const send = async () => {
    try {
      const bins = await Bin.find().sort({ fillLevel: -1 });
      res.write('data: ' + JSON.stringify(bins) + '\n\n');
    } catch(e) {}
  };
  send();
  const interval = setInterval(send, 5000);
  req.on('close', () => clearInterval(interval));
});

// Page auth guard
const pageAuth = (req, res, next) => {
  const jwt = require('jsonwebtoken');
  const token = req.cookies?.token;
  if (!token) return res.redirect('/login');
  try { jwt.verify(token, process.env.JWT_SECRET || 'garbageopt-secret-key'); next(); }
  catch { res.redirect('/login'); }
};

// Pages
app.get('/login',     (req, res) => res.sendFile(path.join(__dirname, 'views/login.html')));
app.get('/',          pageAuth, (req, res) => res.sendFile(path.join(__dirname, 'views/index.html')));
app.get('/routes',    pageAuth, (req, res) => res.sendFile(path.join(__dirname, 'views/routes.html')));
app.get('/analytics', pageAuth, (req, res) => res.sendFile(path.join(__dirname, 'views/analytics.html')));
app.get('/manage',    pageAuth, (req, res) => res.sendFile(path.join(__dirname, 'views/manage.html')));

// Cron: fill bins every minute
cron.schedule('* * * * *', async () => {
  try {
    const bins = await Bin.find({ status: 'active' });
    for (const bin of bins) {
      const rates = { general: [1,5], recyclable: [0.5,2], organic: [2,6] };
      const [min, max] = rates[bin.type] || [1,5];
      bin.fillLevel = Math.min(100, parseFloat((bin.fillLevel + Math.random()*(max-min)+min).toFixed(1)));
      await bin.save();
    }
  } catch(e) { console.error('[CRON]', e.message); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('GarbageOpt running on http://localhost:' + PORT));
