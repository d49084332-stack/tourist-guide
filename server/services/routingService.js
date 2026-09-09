const axios = require('axios');

/**
 * Real-time Road Routing Engine
 * Computes actual road routes, accurate driving distances, real travel times,
 * highway identification, and step-by-step navigation maneuvers.
 * Supports Google Directions API & Project OSRM (Open Source Routing Machine).
 */

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';

// In-memory cache for computed road routes
const routeGeometryCache = new Map();

/**
 * Helper to decode Google polyline string to array of [lat, lon]
 */
function decodeGooglePolyline(str, precision = 5) {
  let index = 0;
  let lat = 0;
  let lng = 0;
  const coordinates = [];
  const factor = Math.pow(10, precision);

  while (index < str.length) {
    let byte = null;
    let shift = 0;
    let result = 0;

    do {
      byte = str.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const latitude_change = (result & 1) ? ~(result >> 1) : (result >> 1);
    shift = 0;
    result = 0;

    do {
      byte = str.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const longitude_change = (result & 1) ? ~(result >> 1) : (result >> 1);

    lat += latitude_change;
    lng += longitude_change;

    coordinates.push([lat / factor, lng / factor]);
  }

  return coordinates;
}

/**
 * Format duration in seconds to human readable string (e.g. "3 hrs 45 mins")
 */
function formatDuration(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.round((seconds % 3600) / 60);

  if (hrs > 0) {
    return `${hrs} hr${hrs > 1 ? 's' : ''} ${mins} min${mins !== 1 ? 's' : ''}`;
  }
  return `${mins} mins`;
}

/**
 * Calculate road route between two real-world GPS coordinates.
 * @param {[number, number]} startCoords - [lat, lon]
 * @param {[number, number]} destCoords - [lat, lon]
 * @returns {Promise<Object>} Route details with road geometry, distance, duration, highway, and steps
 */
const getRoadRoute = async (startCoords, destCoords) => {
  const [startLat, startLon] = startCoords;
  const [destLat, destLon] = destCoords;

  const cacheKey = `${startLat.toFixed(3)}_${startLon.toFixed(3)}_${destLat.toFixed(3)}_${destLon.toFixed(3)}`;
  if (routeGeometryCache.has(cacheKey)) {
    return routeGeometryCache.get(cacheKey);
  }

  // 1. Google Directions API
  if (GOOGLE_MAPS_API_KEY) {
    try {
      const gRes = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
        params: {
          origin: `${startLat},${startLon}`,
          destination: `${destLat},${destLon}`,
          mode: 'driving',
          overview: 'full',
          key: GOOGLE_MAPS_API_KEY
        },
        timeout: 10000
      });

      if (gRes.data.status === 'OK' && gRes.data.routes?.length > 0) {
        const route = gRes.data.routes[0];
        const leg = route.legs[0];
        const waypoints = decodeGooglePolyline(route.overview_polyline.points);

        const distanceKm = Math.round(leg.distance.value / 1000);
        const estimatedDuration = leg.duration.text;
        const routeHighway = route.summary || 'National Highway Corridor';

        const turnByTurnDirections = (leg.steps || []).slice(0, 10).map((step, idx) => ({
          step: idx + 1,
          instruction: step.html_instructions.replace(/<[^>]*>?/gm, ' '),
          distance: step.distance.text,
          road: step.maneuver || 'Highway'
        }));

        return {
          distanceKm,
          estimatedDuration,
          durationSeconds: leg.duration.value,
          routeHighway,
          waypoints,
          turnByTurnDirections,
          provider: 'google'
        };
      }
    } catch (err) {
      console.warn('Google Directions API error, cascading to OSRM real-world routing machine:', err.message);
    }
  }

  // 2. High-accuracy OSRM (Open Source Routing Machine) Live Engine
  // OSRM coordinates order: {longitude},{latitude}
  try {
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${destLon},${destLat}?overview=full&geometries=geojson&steps=true&annotations=distance,duration`;

    const osrmRes = await axios.get(osrmUrl, {
      headers: {
        'User-Agent': 'AITouristGuide/2.0'
      },
      timeout: 12000
    });

    if (osrmRes.data.code === 'Ok' && osrmRes.data.routes?.length > 0) {
      const route = osrmRes.data.routes[0];
      const leg = route.legs[0];

      // GeoJSON coordinates are [lon, lat], convert to [lat, lon] for Leaflet/Google Maps
      const waypoints = route.geometry.coordinates.map(([lon, lat]) => [lat, lon]);

      const distanceKm = Math.round(route.distance / 1000);
      const estimatedDuration = formatDuration(route.duration);

      // Detect prominent highway names from turn maneuvers
      const roadNames = [];
      const steps = [];

      (leg.steps || []).forEach((step, idx) => {
        if (step.name && !roadNames.includes(step.name) && step.name !== '') {
          roadNames.push(step.name);
        }

        if (idx < 12 && step.maneuver) {
          const maneuverType = step.maneuver.type || 'continue';
          const modifier = step.maneuver.modifier ? ` ${step.maneuver.modifier}` : '';
          const roadName = step.name || 'Highway';

          steps.push({
            step: steps.length + 1,
            instruction: `${maneuverType.charAt(0).toUpperCase() + maneuverType.slice(1)}${modifier} onto ${roadName}`,
            distance: `${Math.round(step.distance / 1000 * 10) / 10} km`,
            road: roadName
          });
        }
      });

      const routeHighway = roadNames.length > 0
        ? roadNames.slice(0, 2).join(' / ')
        : 'National Highway Road Corridor';

      const routeResult = {
        distanceKm,
        estimatedDuration,
        durationSeconds: Math.round(route.duration),
        routeHighway,
        waypoints,
        turnByTurnDirections: steps.length > 0 ? steps : [
          { step: 1, instruction: 'Follow navigation signs along highway corridor', distance: `${distanceKm} km`, road: routeHighway }
        ],
        provider: 'osrm'
      };
      routeGeometryCache.set(cacheKey, routeResult);
      return routeResult;
    }
  } catch (err) {
    console.error('OSRM road routing error:', err.message);
  }

  // 3. Fallback Haversine geodesic calculation if external routing network is offline
  const dLat = (destLat - startLat) * Math.PI / 180;
  const dLon = (destLon - startLon) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(startLat * Math.PI / 180) * Math.cos(destLat * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const haversineDist = Math.round(6371 * c);

  // Approximate driving road distance is typically 1.25x the straight-line distance
  const distanceKm = Math.round(haversineDist * 1.25);
  const durationSeconds = Math.round((distanceKm / 65) * 3600); // 65 km/h avg speed

  // Generate intermediate points along geodesic arc
  const waypoints = [];
  const stepsCount = 20;
  for (let i = 0; i <= stepsCount; i++) {
    const f = i / stepsCount;
    waypoints.push([
      startLat + (destLat - startLat) * f,
      startLon + (destLon - startLon) * f
    ]);
  }

  return {
    distanceKm,
    estimatedDuration: formatDuration(durationSeconds),
    durationSeconds,
    routeHighway: 'Interstate Road Corridor',
    waypoints,
    turnByTurnDirections: [
      { step: 1, instruction: `Drive along highway corridor towards destination`, distance: `${distanceKm} km`, road: 'Main Highway' }
    ],
    provider: 'geodesic'
  };
};

module.exports = {
  getRoadRoute,
  formatDuration
};
