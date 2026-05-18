// Haversine distance between two coords (km)
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Greedy nearest-neighbour TSP
function nearestNeighbour(depot, bins) {
  if (!bins.length) return [];
  const route = [];
  const remaining = [...bins];
  let current = depot;

  while (remaining.length > 0) {
    let nearestIdx = 0;
    let minDist = Infinity;
    remaining.forEach((bin, idx) => {
      const d = haversine(current.lat, current.lon, bin.location.lat, bin.location.lon);
      if (d < minDist) { minDist = d; nearestIdx = idx; }
    });
    current = remaining[nearestIdx];
    route.push({ bin: remaining[nearestIdx], distFromPrev: minDist });
    remaining.splice(nearestIdx, 1);
  }
  return route;
}

// 2-opt improvement on route
function twoOpt(route) {
  if (route.length < 4) return route;
  let improved = true;
  let best = [...route];

  while (improved) {
    improved = false;
    for (let i = 0; i < best.length - 1; i++) {
      for (let j = i + 2; j < best.length; j++) {
        const a = best[i].bin.location, b = best[i + 1].bin.location;
        const c = best[j - 1].bin.location, d = best[j].bin.location;
        const before = haversine(a.lat, a.lon, b.lat, b.lon) + haversine(c.lat, c.lon, d.lat, d.lon);
        const after = haversine(a.lat, a.lon, c.lat, c.lon) + haversine(b.lat, b.lon, d.lat, d.lon);
        if (after < before - 0.01) {
          best = [...best.slice(0, i + 1), ...best.slice(i + 1, j).reverse(), ...best.slice(j)];
          improved = true;
        }
      }
    }
  }
  return best;
}

function optimizeRoute(depot, bins, threshold = 50) {
  // Only collect bins above fill threshold
  const fullBins = bins.filter(b => b.fillLevel >= threshold && b.status === 'active');
  if (!fullBins.length) return { route: [], totalDistance: 0, estimatedDuration: 0, co2Saved: 0, skipped: bins.length };

  // Greedy nearest neighbour
  let route = nearestNeighbour(depot, fullBins);

  // 2-opt improvement
  route = twoOpt(route);

  // Recalculate distances after 2-opt
  let totalDistance = 0;
  for (let i = 0; i < route.length; i++) {
    const prev = i === 0 ? depot : route[i - 1].bin.location;
    const curr = route[i].bin.location;
    route[i].distFromPrev = haversine(prev.lat, prev.lon, curr.lat, curr.lon);
    totalDistance += route[i].distFromPrev;
  }

  // Back to depot
  if (route.length > 0) {
    const last = route[route.length - 1].bin.location;
    totalDistance += haversine(last.lat, last.lon, depot.lat, depot.lon);
  }

  // Fixed route distance (visiting all bins in order)
  let fixedDistance = 0;
  for (let i = 0; i < bins.length - 1; i++) {
    fixedDistance += haversine(bins[i].location.lat, bins[i].location.lon, bins[i + 1].location.lat, bins[i + 1].location.lon);
  }

  const avgSpeed = 30; // km/h for garbage truck
  const estimatedDuration = Math.round((totalDistance / avgSpeed) * 60); // minutes
  const co2PerKm = 0.27; // kg CO2 per km for diesel truck
  const co2Saved = parseFloat(((fixedDistance - totalDistance) * co2PerKm).toFixed(2));

  return {
    route,
    totalDistance: parseFloat(totalDistance.toFixed(2)),
    estimatedDuration,
    co2Saved: Math.max(0, co2Saved),
    skipped: bins.length - fullBins.length,
    collected: fullBins.length,
  };
}

module.exports = { optimizeRoute, haversine };
