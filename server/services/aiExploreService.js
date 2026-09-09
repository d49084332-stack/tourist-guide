const axios = require('axios');
const Destination = require('../models/Destination');
const { geocodeAddress } = require('./geoService');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// High-resolution photography by category
const CATEGORY_IMAGES = {
  'Beach': [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000',
    'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1000'
  ],
  'Hill Station': [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000',
    'https://images.unsplash.com/photo-1571536802807-30451e3955d8?w=1000'
  ],
  'Historical': [
    'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1000',
    'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1000'
  ],
  'Heritage': [
    'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=1000',
    'https://images.unsplash.com/photo-1600100397608-f010e42f9b87?w=1000'
  ],
  'Religious': [
    'https://images.unsplash.com/photo-1548013146-72479768bada?w=1000',
    'https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=1000'
  ],
  'Adventure': [
    'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?w=1000',
    'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=1000'
  ],
  'Nature': [
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1000',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1000'
  ]
};

async function callGroqAI(messages) {
  const candidateModels = [
    process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
    'groq/compound-mini',
    'openai/gpt-oss-20b'
  ];

  let lastError = null;
  for (const model of candidateModels) {
    try {
      const res = await axios.post(
        GROQ_API_URL,
        {
          model,
          messages,
          temperature: 0.3,
          max_tokens: 2500,
          response_format: { type: 'json_object' }
        },
        {
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 20000
        }
      );

      if (res.data?.choices?.[0]?.message?.content) {
        return JSON.parse(res.data.choices[0].message.content);
      }
    } catch (err) {
      lastError = err;
      console.warn(`Groq explore discovery error with ${model}, trying next...:`, err.message);
    }
  }

  throw lastError || new Error('Failed to query Groq AI.');
}

/**
 * Dynamically discover real-world tourist destinations for any query or region via AI + Geocoding
 * @param {string} query - Search term (e.g. "Hampi", "Kodaikanal", "Kerala", "Meghalaya", "Himachal")
 * @param {string} category - Category filter (optional)
 * @returns {Promise<Array>}
 */
const discoverDestinationsWithAI = async (query = '', category = '') => {
  console.log(`[AI Explore Engine] Discovering destinations for query="${query}", category="${category}"...`);

  const prompt = `You are an expert travel authority on Indian and international tourism.
A traveler is searching for destinations matching:
Query: "${query || 'Top Tourist Destinations in India'}"
Category: "${category || 'All Categories'}"

Generate 6 to 9 GENUINE, REAL-WORLD tourist destinations matching this search.
For every destination provide:
- name: Real full name of the destination (e.g. "Hampi Heritage Ruins", "Munnar Tea Hills", "Pangong Tso Lake", "Varkala Cliff Beach")
- state: Indian state (or country if international)
- city: Closest city or district
- category: One of ["Beach", "Hill Station", "Historical", "Religious", "Adventure", "Nature", "Heritage"]
- description: 2-3 sentence engaging description highlighting what makes it special
- shortDescription: 1 sentence punchy summary
- estimatedBudget: "Budget" | "Mid-range" | "Premium" | "Luxury"
- bestTimeToVisit: e.g. "October to March"
- duration: e.g. "2-3 days"
- activities: Array of 4 real activities to do there
- nearbyPlaces: Array of 3 real nearby attractions
- travelTips: 1 practical tip for visitors
- rating: Realistic number between 4.6 and 4.9
- reviewCount: Realistic number between 150 and 950

Return valid JSON with format:
{
  "destinations": [ ... ]
}`;

  let aiResult = null;
  try {
    aiResult = await callGroqAI([
      { role: 'system', content: 'You are an expert tourist guide system. Respond strictly in valid JSON.' },
      { role: 'user', content: prompt }
    ]);
  } catch (err) {
    console.error('[AI Explore Engine] AI call error:', err.message);
    return [];
  }

  const rawList = (aiResult?.destinations || []).slice(0, 6);
  console.log(`[AI Explore Engine] Groq returned ${rawList.length} destinations.`);

  // Process and geocode all destinations in parallel for maximum speed
  const processPromises = rawList.map(async (item) => {
    if (!item.name) return null;

    // Check if already in DB
    try {
      let dest = await Destination.findOne({
        $or: [
          { name: { $regex: item.name.split(' ').slice(0, 2).join(' '), $options: 'i' } },
          { slug: item.name.toLowerCase().replace(/[^a-z0-9]/g, '-') }
        ]
      });

      if (dest) return dest;

      // Geocode with 3s timeout
      let lat = 20.5937;
      let lon = 78.9629;
      try {
        const geoPromise = geocodeAddress(`${item.name}, ${item.city || item.state || 'India'}`);
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3500));
        const geo = await Promise.race([geoPromise, timeoutPromise]);
        if (geo?.lat && geo?.lon) {
          lat = geo.lat;
          lon = geo.lon;
        }
      } catch (e) {
        // Fallback default coordinates
      }

      const catImages = CATEGORY_IMAGES[item.category] || CATEGORY_IMAGES['Historical'];
      const images = catImages.map(url => ({ url, alt: item.name }));
      const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4);

      dest = await Destination.create({
        name: item.name,
        slug,
        description: item.description || `Famous tourist destination located in ${item.state || 'India'}.`,
        shortDescription: item.shortDescription || item.description?.slice(0, 100) || item.name,
        category: item.category || 'Historical',
        state: item.state || 'India',
        city: item.city || item.state || 'India',
        country: 'India',
        location: {
          address: `${item.city || ''}, ${item.state || 'India'}`,
          coordinates: [lon, lat]
        },
        images,
        rating: item.rating || 4.8,
        reviewCount: item.reviewCount || 280,
        estimatedBudget: item.estimatedBudget || 'Mid-range',
        bestTimeToVisit: item.bestTimeToVisit || 'October to March',
        duration: item.duration || '2-3 days',
        activities: item.activities || ['Sightseeing', 'Photography', 'Local Cuisine'],
        nearbyPlaces: item.nearbyPlaces || ['City Center', 'Scenic Viewpoint'],
        travelTips: item.travelTips || 'Book accommodations in advance during peak season.',
        isFeatured: true,
        isPopular: true
      });

      return dest;
    } catch (err) {
      console.warn('Destination create error:', err.message);
      return null;
    }
  });

  const results = await Promise.allSettled(processPromises);
  const savedDestinations = results
    .filter(r => r.status === 'fulfilled' && r.value != null)
    .map(r => r.value);

  return savedDestinations;

};

module.exports = {
  discoverDestinationsWithAI
};
