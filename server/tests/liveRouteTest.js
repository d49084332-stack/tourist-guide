const axios = require('axios');

async function testLiveRouting() {
  console.log('\n=== LIVE REAL-WORLD ROUTING & GEOCODING TESTS ===\n');
  let passed = 0, failed = 0;

  // 1. Geocode Delhi
  try {
    const geo = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: { q: 'Delhi, India', format: 'json', limit: 1, addressdetails: 1 },
      headers: { 'User-Agent': 'AITouristGuide/2.0' },
      timeout: 8000
    });
    const g = geo.data[0];
    const lat = parseFloat(g.lat).toFixed(4);
    const lon = parseFloat(g.lon).toFixed(4);
    console.log('PASS  Geocode Delhi:', lat, lon, '(Nominatim live geocoding)');
    passed++;
  } catch(e) { console.error('FAIL  Geocode Delhi:', e.message); failed++; }

  // 2. Geocode Goa
  try {
    const geo = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: { q: 'Goa, India', format: 'json', limit: 1 },
      headers: { 'User-Agent': 'AITouristGuide/2.0' },
      timeout: 8000
    });
    const g = geo.data[0];
    console.log('PASS  Geocode Goa:', parseFloat(g.lat).toFixed(4), parseFloat(g.lon).toFixed(4));
    passed++;
  } catch(e) { console.error('FAIL  Geocode Goa:', e.message); failed++; }

  // 3. OSRM: Delhi to Agra (real road route)
  try {
    const osrm = await axios.get(
      'https://router.project-osrm.org/route/v1/driving/77.2090,28.6139;78.0081,27.1767?overview=full&geometries=geojson&steps=true',
      { headers: { 'User-Agent': 'AITouristGuide/2.0' }, timeout: 12000 }
    );
    const r = osrm.data.routes[0];
    const distKm = Math.round(r.distance / 1000);
    const durationMins = Math.round(r.duration / 60);
    const wpCount = r.geometry.coordinates.length;
    const step0 = r.legs[0].steps[0];
    console.log('PASS  OSRM Delhi->Agra:', distKm, 'km |', durationMins, 'min | Road polyline:', wpCount, 'real-world points');
    console.log('      First maneuver:', step0.maneuver.type, 'on road:', step0.name || '(unnamed)');
    passed++;
  } catch(e) { console.error('FAIL  OSRM Delhi->Agra:', e.message); failed++; }

  // 4. OSRM: Mumbai to Goa
  try {
    const osrm = await axios.get(
      'https://router.project-osrm.org/route/v1/driving/72.8777,19.0760;73.8278,15.4909?overview=full&geometries=geojson&steps=true',
      { headers: { 'User-Agent': 'AITouristGuide/2.0' }, timeout: 12000 }
    );
    const r = osrm.data.routes[0];
    console.log('PASS  OSRM Mumbai->Goa:', Math.round(r.distance/1000), 'km |', Math.round(r.duration/3600), 'hrs | Polyline:', r.geometry.coordinates.length, 'points');
    passed++;
  } catch(e) { console.error('FAIL  OSRM Mumbai->Goa:', e.message); failed++; }

  // 5. Overpass: real temples near Agra
  try {
    const query = `[out:json][timeout:10];
(node["amenity"="place_of_worship"]["religion"="hindu"](around:20000,27.1767,78.0081););
out body;`;
    const ov = await axios.post('https://overpass-api.de/api/interpreter', query, {
      headers: { 'Content-Type': 'text/plain' },
      timeout: 15000
    });
    const temples = (ov.data.elements || []).filter(e => e.tags && e.tags.name);
    console.log('PASS  Overpass Hindu Temples near Agra:', temples.length, 'real temples found');
    if (temples[0]) {
      console.log('      Sample:', temples[0].tags.name, '@', temples[0].lat.toFixed(5), temples[0].lon.toFixed(5), '(OSM live data)');
    }
    passed++;
  } catch(e) { console.error('FAIL  Overpass temples Agra:', e.message); failed++; }

  // 6. Overpass: beaches near Goa
  try {
    const query = `[out:json][timeout:10];
(node["natural"="beach"](around:25000,15.4909,73.8278););
out body;`;
    const ov = await axios.post('https://overpass-api.de/api/interpreter', query, {
      headers: { 'Content-Type': 'text/plain' },
      timeout: 15000
    });
    const beaches = (ov.data.elements || []).filter(e => e.tags && e.tags.name);
    console.log('PASS  Overpass Beaches near Goa:', beaches.length, 'real beaches found');
    if (beaches[0]) {
      console.log('      Sample:', beaches[0].tags.name, '@', beaches[0].lat.toFixed(5), beaches[0].lon.toFixed(5));
    }
    passed++;
  } catch(e) { console.error('FAIL  Overpass beaches Goa:', e.message); failed++; }

  // 7. Backend: /api/routes/plan (Mumbai to Pune — arbitrary non-curated route)
  try {
    const r = await axios.get('http://localhost:5000/api/routes/plan', {
      params: { start: 'Mumbai', destination: 'Pune' },
      timeout: 25000
    });
    if (r.data.success) {
      const route = r.data.route;
      const hasRealRoads = (route.waypoints || []).length > 10;
      console.log('PASS  Backend route/plan Mumbai->Pune:', route.distanceKm, 'km |', route.estimatedDuration, '| Places found:', route.places.length, '| Route engine:', route.provider);
      console.log('      Real road polyline:', hasRealRoads ? 'YES (' + route.waypoints.length + ' waypoints)' : 'WARN (only ' + route.waypoints.length + ' pts)');
      passed++;
    } else {
      throw new Error(r.data.message);
    }
  } catch(e) { console.error('FAIL  Backend route/plan:', e.response ? JSON.stringify(e.response.data) : e.message); failed++; }

  // 8. Backend: reverse-geocode endpoint
  try {
    const r = await axios.get('http://localhost:5000/api/routes/reverse-geocode', {
      params: { lat: 28.6139, lon: 77.2090 },
      timeout: 8000
    });
    if (r.data.success) {
      console.log('PASS  Reverse geocode [28.6139, 77.2090]:', r.data.city + ',', r.data.state + ',', r.data.country);
      passed++;
    } else {
      throw new Error(r.data.message);
    }
  } catch(e) { console.error('FAIL  Reverse geocode:', e.response ? JSON.stringify(e.response.data) : e.message); failed++; }

  // 9. Backend: Chennai to Pondicherry (coastal route)
  try {
    const r = await axios.get('http://localhost:5000/api/routes/plan', {
      params: { start: 'Chennai', destination: 'Pondicherry' },
      timeout: 25000
    });
    if (r.data.success) {
      const route = r.data.route;
      console.log('PASS  Backend route/plan Chennai->Pondicherry:', route.distanceKm, 'km |', route.estimatedDuration, '| Corridor places:', route.places.length);
      passed++;
    } else {
      throw new Error(r.data.message);
    }
  } catch(e) { console.error('FAIL  Backend Chennai->Pondicherry:', e.response ? JSON.stringify(e.response.data) : e.message); failed++; }

  console.log('\n====================================================');
  console.log('LIVE ROUTING INTEGRATION TEST SUMMARY:');
  console.log('  Total:', passed + failed, '| PASSED:', passed, '| FAILED:', failed);
  console.log('====================================================\n');
  process.exit(failed > 0 ? 1 : 0);
}

testLiveRouting();
