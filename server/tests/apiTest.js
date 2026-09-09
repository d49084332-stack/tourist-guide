const axios = require('axios');

const BASE_URL = process.env.API_URL || 'http://localhost:5000';
let authToken = null;
let testUserId = null;
let testHotelId = null;
let testBookingId = null;
let testBookingDocId = null;

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

const logPass = (title, details = '') => {
  console.log(`  ${colors.green}✓ PASS:${colors.reset} ${colors.bold}${title}${colors.reset} ${details ? colors.cyan + details + colors.reset : ''}`);
};

const logFail = (title, err) => {
  console.error(`  ${colors.red}✗ FAIL:${colors.reset} ${colors.bold}${title}${colors.reset}`);
  console.error(`    ${colors.red}Error:${colors.reset}`, err.response?.data || err.message);
};

const runAllTests = async () => {
  console.log(`\n${colors.bold}${colors.cyan}====================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}🚀 RUNNING AI TOURIST GUIDE END-TO-END API TEST SUITE${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}Target Base URL: ${BASE_URL}${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}====================================================\n${colors.reset}`);

  let passed = 0;
  let failed = 0;

  // 1. HEALTH CHECK
  try {
    const res = await axios.get(`${BASE_URL}/health`);
    if (res.status === 200 && res.data.status === 'Server is running') {
      logPass('Server Health Check', `[Status: ${res.data.status}]`);
      passed++;
    } else {
      throw new Error('Unexpected health response');
    }
  } catch (err) {
    logFail('Server Health Check', err);
    failed++;
  }

  // 2. AUTHENTICATION (REGISTER & LOGIN)
  const testEmail = `test.traveler.${Date.now()}@example.com`;
  const testPassword = 'Password@123';

  try {
    const regRes = await axios.post(`${BASE_URL}/api/auth/register`, {
      name: 'Rohan Mehta',
      email: testEmail,
      password: testPassword
    });

    if (regRes.status === 201 && regRes.data.token) {
      authToken = regRes.data.token;
      testUserId = regRes.data.user?.id;
      logPass('User Registration', `[Registered: ${testEmail}]`);
      passed++;
    } else {
      throw new Error('No token returned on registration');
    }
  } catch (err) {
    logFail('User Registration', err);
    failed++;
  }

  try {
    const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: testEmail,
      password: testPassword
    });

    if (loginRes.status === 200 && loginRes.data.token) {
      authToken = loginRes.data.token;
      logPass('User Login & JWT Issuance', `[User: ${loginRes.data.user?.name}]`);
      passed++;
    } else {
      throw new Error('Login failed to return token');
    }
  } catch (err) {
    logFail('User Login & JWT Issuance', err);
    failed++;
  }

  // 3. USER PROFILE (PROTECTED ROUTE)
  try {
    const profileRes = await axios.get(`${BASE_URL}/api/user/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    if (profileRes.status === 200 && profileRes.data.user) {
      logPass('User Profile Access (Protected)', `[Email: ${profileRes.data.user.email}]`);
      passed++;
    } else {
      throw new Error('Profile fetch failed');
    }
  } catch (err) {
    logFail('User Profile Access', err);
    failed++;
  }

  // 4. DESTINATIONS CATALOG
  let sampleDestId = null;
  try {
    const destRes = await axios.get(`${BASE_URL}/api/destinations?limit=10`);
    if (destRes.status === 200 && destRes.data.destinations?.length > 0) {
      sampleDestId = destRes.data.destinations[0]._id;
      logPass('Get Destinations Catalog', `[Total: ${destRes.data.total}, Sample: ${destRes.data.destinations[0].name}]`);
      passed++;
    } else {
      throw new Error('No destinations returned');
    }
  } catch (err) {
    logFail('Get Destinations Catalog', err);
    failed++;
  }

  // 5. DESTINATION DETAILS
  try {
    if (sampleDestId) {
      const destDetailRes = await axios.get(`${BASE_URL}/api/destinations/${sampleDestId}`);
      if (destDetailRes.status === 200 && destDetailRes.data.destination) {
        logPass('Get Destination Details by ID', `[Category: ${destDetailRes.data.destination.category}]`);
        passed++;
      } else {
        throw new Error('Destination detail fetch failed');
      }
    }
  } catch (err) {
    logFail('Get Destination Details', err);
    failed++;
  }

  // 6. SMART ROUTE & NEARBY PLACES DISCOVERY API
  try {
    const routeRes = await axios.get(`${BASE_URL}/api/routes/plan?start=Delhi&destination=Agra`);
    if (
      routeRes.status === 200 &&
      routeRes.data.success &&
      routeRes.data.route.distanceKm > 0 &&
      routeRes.data.route.places?.length > 0
    ) {
      const r = routeRes.data.route;
      const categoriesFound = [...new Set(r.places.map(p => p.category))].join(', ');
      logPass('Smart Route Planning & Corridor Discovery', `[${r.startName} ➔ ${r.destName} | ${r.distanceKm} km | Discovered: ${r.places.length} places (${categoriesFound})]`);
      passed++;
    } else {
      throw new Error('Invalid route planning response');
    }
  } catch (err) {
    logFail('Smart Route Planning', err);
    failed++;
  }

  // 6b. ARBITRARY CUSTOM ROUTE (AI Corridor Detection: Hyderabad to Hampi)
  try {
    const customRouteRes = await axios.get(`${BASE_URL}/api/routes/plan?start=Hyderabad&destination=Hampi`, { timeout: 25000 });
    if (
      customRouteRes.status === 200 &&
      customRouteRes.data.success &&
      customRouteRes.data.route.places?.length > 0
    ) {
      const r = customRouteRes.data.route;
      const hotelCount = r.places.filter(p => p.isHotel).length;
      logPass('Arbitrary Custom Route (AI Corridor Analysis)', `[${r.startName} ➔ ${r.destName} | ${r.distanceKm} km | AI Discovered: ${r.places.length} genuine stopovers (${hotelCount} hotels with Book Now)]`);
      passed++;
    } else {
      throw new Error('Custom route planning failed');
    }
  } catch (err) {
    logFail('Arbitrary Custom Route Planning', err);
    failed++;
  }

  // 6c. AI LIVE EXPLORE DESTINATION DISCOVERY
  try {
    const aiExploreRes = await axios.get(`${BASE_URL}/api/destinations/ai-discover?q=Coorg`, { timeout: 20000 });
    if (
      aiExploreRes.status === 200 &&
      aiExploreRes.data.success &&
      aiExploreRes.data.destinations?.length > 0
    ) {
      const d = aiExploreRes.data.destinations[0];
      logPass('AI Live Destination Discovery', `[Query: Coorg | Discovered: ${aiExploreRes.data.count} real destinations | Sample: ${d.name} (${d.category})]`);
      passed++;
    } else {
      throw new Error('AI Explore discovery failed');
    }
  } catch (err) {
    logFail('AI Live Destination Discovery', err);
    failed++;
  }


  // 7. HOTELS & ROOM INVENTORY
  try {
    const hotelRes = await axios.get(`${BASE_URL}/api/hotels`);
    if (hotelRes.status === 200 && hotelRes.data.hotels?.length > 0) {
      testHotelId = hotelRes.data.hotels[0]._id;
      const h = hotelRes.data.hotels[0];
      logPass('Hotels & Room Inventory', `[Found: ${hotelRes.data.total} hotels, Sample: ${h.name} with ${h.rooms?.length} room types]`);
      passed++;
    } else {
      throw new Error('No hotels found in inventory');
    }
  } catch (err) {
    logFail('Hotels & Room Inventory', err);
    failed++;
  }

  // 8. HOTEL BOOKING & PAYMENT SYSTEM
  try {
    const bookingPayload = {
      hotelId: testHotelId,
      roomType: 'Deluxe Room',
      checkInDate: new Date(Date.now() + 86400000).toISOString(),
      checkOutDate: new Date(Date.now() + 3 * 86400000).toISOString(),
      guests: 2,
      roomsCount: 1,
      paymentMethod: 'PhonePe',
      guestDetails: {
        fullName: 'Rohan Mehta',
        email: testEmail,
        phone: '+91 98765 12345'
      }
    };

    const bookRes = await axios.post(`${BASE_URL}/api/bookings`, bookingPayload, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    if (bookRes.status === 201 && bookRes.data.booking) {
      const b = bookRes.data.booking;
      testBookingDocId = b._id;
      testBookingId = b.bookingId;
      logPass('Create Booking with Secure Payment', `[ID: ${b.bookingId} | Method: ${b.paymentMethod} | Amount: ₹${b.totalAmount} (Taxes: ₹${b.taxAmount}) | Txn: ${b.transactionId}]`);
      passed++;
    } else {
      throw new Error('Booking creation failed');
    }
  } catch (err) {
    logFail('Create Booking with Secure Payment', err);
    failed++;
  }

  // 9. RETRIEVE USER BOOKINGS
  try {
    const myBookingsRes = await axios.get(`${BASE_URL}/api/bookings/my-bookings`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    if (myBookingsRes.status === 200 && myBookingsRes.data.bookings?.length > 0) {
      logPass('Retrieve User Bookings', `[Count: ${myBookingsRes.data.count}]`);
      passed++;
    } else {
      throw new Error('Could not fetch user bookings');
    }
  } catch (err) {
    logFail('Retrieve User Bookings', err);
    failed++;
  }

  // 10. MARK TRIP COMPLETED (FOR ABOUT PAGE COMPLETED TRIPS SECTION)
  try {
    if (testBookingDocId) {
      const compRes = await axios.put(
        `${BASE_URL}/api/bookings/${testBookingDocId}/complete-trip`,
        {
          tripSummary: 'Amazing road trip along the corridor visiting historic forts and local food courts.',
          placesVisited: ['Heritage Fort', 'Highway Dhaba', 'Temple Shrine']
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (compRes.status === 200 && compRes.data.booking.isCompletedTrip) {
        logPass('Mark Trip as Completed (About Page Subsection)', `[Booking: ${testBookingId} Status: ${compRes.data.booking.bookingStatus}]`);
        passed++;
      } else {
        throw new Error('Could not mark trip as completed');
      }
    }
  } catch (err) {
    logFail('Mark Trip Completed', err);
    failed++;
  }

  // 11. SUBMIT RATINGS & USER FEEDBACK (ABOUT PAGE)
  try {
    const feedRes = await axios.post(
      `${BASE_URL}/api/feedback`,
      {
        userName: 'Rohan Mehta',
        userEmail: testEmail,
        type: 'trip_review',
        category: 'Travel Experience',
        rating: 5,
        destination: 'Agra Corridor',
        comment: 'Outstanding smart route accuracy and instant PhonePe hotel booking experience! The POI markers were spot on.'
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    if (feedRes.status === 201 && feedRes.data.success) {
      logPass('Submit Traveler Review & Feedback', `[Rating: 5 Stars | Category: Travel Experience]`);
      passed++;
    } else {
      throw new Error('Feedback submission failed');
    }
  } catch (err) {
    logFail('Submit Traveler Review & Feedback', err);
    failed++;
  }

  // 12. GET RATINGS DISTRIBUTION & REVIEWS (ABOUT PAGE)
  try {
    const getFeedRes = await axios.get(`${BASE_URL}/api/feedback`);
    if (getFeedRes.status === 200 && getFeedRes.data.feedbacks) {
      logPass('Fetch Ratings Distribution & Feedbacks', `[Avg Rating: ${getFeedRes.data.avgRating} / 5.0 | Total Reviews: ${getFeedRes.data.total}]`);
      passed++;
    } else {
      throw new Error('Could not fetch feedback statistics');
    }
  } catch (err) {
    logFail('Fetch Ratings Distribution', err);
    failed++;
  }

  // 13. GROQ AI SMART TOURIST GUIDE INFERENCE (llama-3.1-8b-instant)
  try {
    const startTime = Date.now();
    const aiRes = await axios.post(
      `${BASE_URL}/api/chat/message`,
      {
        message: 'Give me 3 top tips for visiting the Taj Mahal at sunrise.'
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
        timeout: 20000
      }
    );

    const latency = Date.now() - startTime;
    if (aiRes.status === 200 && aiRes.data.message) {
      const preview = aiRes.data.message.substring(0, 100).replace(/\n/g, ' ');
      logPass('Groq LLaMA 3.1 8B Tourist Guide AI Inference', `[Latency: ${latency}ms | Response Preview: "${preview}..."]`);
      passed++;
    } else {
      throw new Error('AI response empty or failed');
    }
  } catch (err) {
    logFail('Groq LLaMA 3.1 Tourist Guide AI Inference', err);
    failed++;
  }

  console.log(`\n${colors.bold}${colors.cyan}====================================================${colors.reset}`);
  console.log(`${colors.bold}TEST SUITE SUMMARY:${colors.reset}`);
  console.log(`  Total Tests Run: ${passed + failed}`);
  console.log(`  ${colors.green}Passed:${colors.reset} ${passed}`);
  console.log(`  ${colors.red}Failed:${colors.reset} ${failed}`);
  console.log(`${colors.bold}${colors.cyan}====================================================\n${colors.reset}`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
};

runAllTests();
