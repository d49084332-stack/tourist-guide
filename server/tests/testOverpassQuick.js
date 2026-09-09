const axios = require('axios');

async function testOverpass() {
  const query = `[out:json][timeout:10];
(
  node["tourism"~"attraction|viewpoint|hotel|guest_house"](around:10000,28.6139,77.2090,27.1767,78.0081);
  node["amenity"~"place_of_worship|restaurant"](around:10000,28.6139,77.2090,27.1767,78.0081);
  node["historic"~"castle|fort|monument"](around:10000,28.6139,77.2090,27.1767,78.0081);
  node["natural"~"beach|waterfall"](around:10000,28.6139,77.2090,27.1767,78.0081);
);
out body 40;`;

  const start = Date.now();
  const res = await axios.post('https://overpass-api.de/api/interpreter', query, {
    headers: { 'Content-Type': 'text/plain' },
    timeout: 10000
  });

  const valid = res.data.elements.filter(e => e.tags && (e.tags.name || e.tags['name:en']));
  console.log(`Overpass returned ${res.data.elements.length} raw elements, ${valid.length} named places in ${Date.now() - start}ms!`);
  if (valid.length > 0) {
    console.log('Sample 1:', valid[0].tags.name, `[${valid[0].lat}, ${valid[0].lon}]`);
    console.log('Sample 2:', valid[1]?.tags?.name, `[${valid[1]?.lat}, ${valid[1]?.lon}]`);
  }
}

testOverpass().catch(err => console.error('Error:', err.message));
