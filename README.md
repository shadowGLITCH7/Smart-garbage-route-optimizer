# 🚛 GarbageOpt — Smart Garbage Collection Route Optimizer

A full-stack Node.js app that optimizes garbage truck routes using real-time bin fill levels, nearest-neighbour + 2-opt routing algorithm, and a live map dashboard.

---

## Tech Stack
- **Backend**: Node.js, Express.js
- **Database**: MongoDB + Mongoose
- **Algorithm**: Nearest-Neighbour + 2-Opt TSP optimization
- **Frontend**: HTML, CSS, Vanilla JS
- **Maps**: Leaflet.js (OpenStreetMap)
- **Charts**: Chart.js
- **Real-time**: Server-Sent Events (SSE)
- **Scheduler**: node-cron (auto fill simulation)

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Make sure MongoDB is running
Open MongoDB Compass and connect to `mongodb://localhost:27017`

### 3. Create `.env` file 
```
MONGO_URI=mongodb://localhost:27017/garbage_optimizer
PORT=3000
```

### 4. Seed the database
```bash
npm run seed
```
This creates 20 bins across 4 zones in Ranchi.

### 5. Start the server
```bash
npm start
```

Open http://localhost:3000

---

## Pages

| Page | URL | Description |
|------|-----|-------------|
| Dashboard | `/` | Live map with all bins, fill levels, filters |
| Route Planner | `/routes` | Generate optimized routes, view steps |
| Analytics | `/analytics` | Charts, zone stats, collection logs |

---

## API Endpoints

### Bins
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bins` | Get all bins (supports ?zone=, ?type=, ?minFill=) |
| GET | `/api/bins/:id` | Get single bin |
| POST | `/api/bins` | Create new bin |
| PATCH | `/api/bins/:id/fill` | Update fill level |
| POST | `/api/bins/:id/collect` | Collect bin (resets to 0) |
| DELETE | `/api/bins/:id` | Delete bin |
| GET | `/api/bins/stats/summary` | Zone/fill statistics |

### Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/routes/generate` | Generate optimized route |
| GET | `/api/routes` | Get all routes |
| PATCH | `/api/routes/:id/complete` | Complete route, reset all bins |
| GET | `/api/routes/logs` | Collection logs |
| GET | `/api/routes/analytics/summary` | Analytics summary |

### Stream
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stream` | SSE — live bin updates every 5s |

---

## Algorithm

**Nearest Neighbour** — greedy approach, always goes to closest unvisited bin.
**2-Opt** — improves the route by reversing segments that cross each other.
**Threshold filtering** — only collects bins above the configured fill % threshold.

---

## Features
- 🗺️ Live map with colour-coded bin markers (red/yellow/green)
- ⚡ Optimized route generation with 2-opt improvement
- 📊 Analytics with 4 charts + zone breakdown table
- 🔄 Auto bin fill simulation via cron job (every minute)
- 📡 Real-time SSE updates to dashboard
- ✅ One-click route completion (resets all bins)
- 🌍 CO₂ savings calculation vs fixed routes
- 🚛 Multi-truck assignment

---

## Project Structure
```
garbage-optimizer/
├── models/
│   ├── Bin.js             # Bin schema
│   ├── Route.js           # Route schema
│   └── CollectionLog.js   # Collection history
├── routes/
│   ├── bins.js            # Bin API routes
│   ├── routeApi.js        # Route API routes
│   └── optimizer.js       # TSP algorithm
├── views/
│   ├── index.html         # Dashboard
│   ├── routes.html        # Route planner
│   └── analytics.html     # Analytics
├── public/
│   └── css/styles.css     # Stylesheet
├── server.js              # Express server + cron
├── seed.js                # DB seeder
├── simulator.js           # IoT fill simulator
└── .env                   # Config
```
