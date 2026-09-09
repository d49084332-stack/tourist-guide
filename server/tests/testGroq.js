const axios = require('axios');
const key = process.env.GROQ_API_KEY;

if (!key) {
  throw new Error('GROQ_API_KEY is required to run this test');
}

function extractJSON(raw) {
  if (!raw) return null;
  let s = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/g, '').trim();
  try { return JSON.parse(s); } catch (_) {}
  const start = s.indexOf('{');
  if (start < 0) return null;
  s = s.slice(start);
  try { return JSON.parse(s); } catch (_) {}
  let repaired = s;
  const lastFullItem = repaired.lastIndexOf('},');
  if (lastFullItem > 0) {
    repaired = repaired.slice(0, lastFullItem + 1) + ']}}';
    try { return JSON.parse(repaired); } catch (_) {}
  }
  repaired = s.replace(/,\s*$/, '') + ']}}';
  try { return JSON.parse(repaired); } catch (_) {}
  return null;
}

const startCity = 'Vijayawada', destCity = 'Hyderabad', routeHighway = 'NH 65';
const prompt = `Indian tourism expert. Route: "${startCity}" to "${destCity}" via "${routeHighway}".

List exactly 6 real places to stop along this highway route (physically within 10 km).
Mix: 2 hotels, 2 tourist spots (temple/fort/attraction), 1 restaurant/dhaba, 1 fuel/cafe.

Return ONLY this JSON (no extra text):
{"corridorSummary":"brief summary","suggestedStopovers":["stop1","stop2"],"highwayTravelTip":"tip","places":[{"name":"name","category":"Hotel or Temple or Fort or Restaurant or Cafe or Fuel or Tourist Attraction or Viewpoint or Historical Place","locationAddress":"Town, State","searchQuery":"Place, City","description":"short 1-sentence","rating":4.5,"reviewCount":200,"pricePerNight":3500,"suggestedStopType":"Rest and Stay or Scenic Detour or Cultural Heritage or Quick Break"}]}`;

const models = ['openai/gpt-oss-20b', 'groq/compound-mini'];

async function test() {
  for (const model of models) {
    try {
      const r = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model,
        messages: [
          { role: 'system', content: 'You are an expert GPS travel guide. Respond only with valid JSON, no extra text.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 3000,
        temperature: 0.3
      }, {
        headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
        timeout: 35000
      });
      const raw = r.data.choices[0].message.content.trim();
      const finishReason = r.data.choices[0].finish_reason;
      console.log(`Model: ${model} | finish_reason: ${finishReason} | raw length: ${raw.length}`);
      const parsed = extractJSON(raw);
      if (parsed) {
        console.log(`SUCCESS with model: ${model}`);
        console.log('Places found:', parsed.places?.length);
        parsed.places?.forEach(p => console.log(' -', p.category, ':', p.name, '|', p.locationAddress));
        return;
      }
      console.warn('Could not parse JSON. RAW:', raw.slice(0, 300));
    } catch (e) {
      console.error(`FAILED ${model}:`, e.response?.status, e.response?.data?.error?.message || e.message);
    }
  }
}

test();



