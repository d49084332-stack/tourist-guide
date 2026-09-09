const axios = require('axios');

async function testVijayawadaHyderabad() {
  console.log('Testing Route: Vijayawada ➔ Hyderabad...');
  const start = Date.now();
  const res = await axios.get('http://localhost:5000/api/routes/plan', {
    params: {
      start: 'Vijayawada',
      destination: 'Hyderabad',
      radius: 10
    },
    timeout: 25000
  });

  const d = res.data;
  console.log('Success:', d.success);
  console.log('Route:', d.route.startCity, 'to', d.route.destCity);
  console.log('Distance:', d.route.distanceKm, 'km, Duration:', d.route.estimatedDuration);
  console.log('Highway:', d.route.routeHighway);
  console.log('Total places in corridor within 10km:', d.route.totalPlacesInCorridor);
  console.log('Category breakdown:', JSON.stringify(d.route.categoryCounts, null, 2));
  console.log('Sample places:');
  for (const p of d.route.places.slice(0, 5)) {
    console.log(` - [${p.category}] ${p.name} | ${p.distanceFromRouteKm} | Hours: ${p.openingHours} | Nav: ${p.googleMapsUrl?.slice(0, 45)}...`);
  }
}

testVijayawadaHyderabad().catch(err => {
  console.error('Test failed:', err.response?.data || err.message);
  process.exit(1);
});
