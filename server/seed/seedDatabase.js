require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Destination = require('../models/Destination');
const User = require('../models/User');
const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking');
const Feedback = require('../models/Feedback');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');
  } catch (error) {
    console.error('❌ Connection error:', error);
    process.exit(1);
  }
};

const destinationData = [
  {
    name: 'Taj Mahal',
    description: 'The Taj Mahal is an ivory-white marble mausoleum on the right bank of the Yamuna river in Agra, Uttar Pradesh. Commissioned in 1631 by Mughal Emperor Shah Jahan to house the tomb of his favorite wife Mumtaz Mahal.',
    shortDescription: 'Iconic UNESCO World Heritage monument of eternal love',
    country: 'India',
    state: 'Uttar Pradesh',
    city: 'Agra',
    location: {
      address: 'Dharmapuri, Forest Colony, Tajganj, Agra, Uttar Pradesh 282001',
      coordinates: [78.0421, 27.1751]
    },
    images: [
      { url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800', alt: 'Taj Mahal main view' },
      { url: 'https://images.unsplash.com/photo-1599661046289-e31897846ab7?w=800', alt: 'Taj Mahal at sunset' }
    ],
    category: 'Historical',
    activities: ['Photography', 'Heritage Walking Tour', 'Mughal History', 'Architecture Study'],
    bestTimeToVisit: 'October to March',
    estimatedBudget: 'Mid-range',
    duration: '1-2 days',
    travelTips: 'Arrive at sunrise for mesmerizing golden views and minimal crowds.',
    nearbyPlaces: ['Agra Fort', 'Mehtab Bagh', 'Itimad-ud-Daulah', 'Fatehpur Sikri'],
    rating: 4.9,
    reviewCount: 420,
    featured: true,
    popular: true
  },
  {
    name: 'Jaipur Pink City',
    description: 'Jaipur is the royal capital of Rajasthan, founded in 1727 by Maharaja Sawai Jai Singh II. Known for its trademark terracotta pink architecture, grand forts, and vibrant bazaars.',
    shortDescription: 'The Pink City - Regal palaces, hill forts, and royal Rajasthani heritage',
    country: 'India',
    state: 'Rajasthan',
    city: 'Jaipur',
    location: {
      address: 'Old City, Jaipur, Rajasthan 302002',
      coordinates: [75.8267, 26.9239]
    },
    images: [
      { url: 'https://images.unsplash.com/photo-1607231350221-d7f39b73cf57?w=800', alt: 'City Palace Jaipur' },
      { url: 'https://images.unsplash.com/photo-1612135881213-ef171a72cb86?w=800', alt: 'Hawa Mahal' }
    ],
    category: 'Heritage',
    activities: ['Fort Exploration', 'Palace Tours', 'Traditional Textile Shopping', 'Hot Air Ballooning'],
    bestTimeToVisit: 'October to March',
    estimatedBudget: 'Mid-range',
    duration: '2-3 days',
    travelTips: 'Combine Amer Fort, Jaigarh Fort, and Nahargarh with a composite ticket.',
    nearbyPlaces: ['Hawa Mahal', 'Amer Fort', 'Jantar Mantar', 'City Palace', 'Nahargarh Fort'],
    rating: 4.8,
    reviewCount: 380,
    featured: true,
    popular: true
  },
  {
    name: 'Goa Coastal Paradise',
    description: 'India\'s premier coastal getaway boasting sun-drenched Arabian Sea beaches, Portuguese colonial architecture, bohemian flea markets, and mouthwatering seafood.',
    shortDescription: 'Sun, sand, azure beaches, and relaxed tropical vibes',
    country: 'India',
    state: 'Goa',
    city: 'Panaji',
    location: {
      address: 'North & South Goa Coastlines',
      coordinates: [73.8567, 15.4989]
    },
    images: [
      { url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800', alt: 'Goa Beach Resort' },
      { url: 'https://images.unsplash.com/photo-1591080876819-7c2f17ba36dc?w=800', alt: 'Goa Sunset Palm Trees' }
    ],
    category: 'Beach',
    activities: ['Scuba Diving', 'Parasailing', 'Sunset Cruise', 'Beach Shacks & Nightlife', 'Heritage Walks'],
    bestTimeToVisit: 'November to February',
    estimatedBudget: 'Mid-range',
    duration: '3-5 days',
    travelTips: 'Rent a scooter to easily explore hidden South Goa coves like Palolem and Agonda.',
    nearbyPlaces: ['Aguada Fort', 'Calangute Beach', 'Baga Beach', 'Dudhsagar Falls', 'Old Goa Churches'],
    rating: 4.8,
    reviewCount: 510,
    featured: true,
    popular: true
  },
  {
    name: 'Kerala Backwaters & Alleppey',
    description: 'An idyllic network of interlocking lagoons, lakes, and palm-fringed canals running parallel to the Arabian Sea. Houseboat stays provide an unforgettable tranquil travel experience.',
    shortDescription: 'Serene palm-lined lagoons and peaceful traditional houseboat cruises',
    country: 'India',
    state: 'Kerala',
    city: 'Alappuzha',
    location: {
      address: 'Vembanad Lake, Alleppey, Kerala',
      coordinates: [76.3388, 9.4981]
    },
    images: [
      { url: 'https://images.unsplash.com/photo-1596652516698-2582a55f802a?w=800', alt: 'Kerala Backwaters Houseboat' },
      { url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800', alt: 'Munnar Tea Hills' }
    ],
    category: 'Nature',
    activities: ['Kettuvallam Houseboat Cruise', 'Ayurvedic Spa & Wellness', 'Bird Watching', 'Village Walks'],
    bestTimeToVisit: 'September to March',
    estimatedBudget: 'Premium',
    duration: '2-3 days',
    travelTips: 'Opt for an overnight houseboat with authentic traditional Keralite meals.',
    nearbyPlaces: ['Marari Beach', 'Kumarakom Bird Sanctuary', 'Pathiramanal Island', 'Kochi Fort'],
    rating: 4.9,
    reviewCount: 340,
    featured: true,
    popular: true
  },
  {
    name: 'Varanasi Ancient Ghats',
    description: 'One of the world\'s oldest continuously inhabited cities. Varanasi sits on the sacred banks of the Ganges, offering deeply spiritual morning boat rides and hypnotic evening Ganga Aarti ceremonies.',
    shortDescription: 'Spiritual heart of India with sacred Ganges river ceremonies',
    country: 'India',
    state: 'Uttar Pradesh',
    city: 'Varanasi',
    location: {
      address: 'Dashashwamedh Ghat, Varanasi, Uttar Pradesh 221001',
      coordinates: [83.0076, 25.3176]
    },
    images: [
      { url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800', alt: 'Varanasi Ghats and Ganges' },
      { url: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=800', alt: 'Evening Aarti' }
    ],
    category: 'Religious',
    activities: ['Sunrise Ganga Boat Ride', 'Evening Aarti Ritual', 'Temple Pilgrimage', 'Sarnath Buddhist Tour'],
    bestTimeToVisit: 'October to March',
    estimatedBudget: 'Budget',
    duration: '2-3 days',
    travelTips: 'Attend the Dashashwamedh Ghat evening aarti from a wooden boat on the river.',
    nearbyPlaces: ['Kashi Vishwanath Temple', 'Sarnath', 'Assi Ghat', 'Manikarnika Ghat'],
    rating: 4.9,
    reviewCount: 460,
    featured: true,
    popular: true
  },
  {
    name: 'Ooty & Nilgiri Hills',
    description: 'The Queen of Hill Stations perched at 2,240 meters in Tamil Nadu\'s Nilgiri mountains. Blessed with lush tea plantations, eucalyptus groves, and the UNESCO Nilgiri Mountain Toy Train.',
    shortDescription: 'Queen of Hill Stations with rolling tea estates and cool mist',
    country: 'India',
    state: 'Tamil Nadu',
    city: 'Ooty',
    location: {
      address: 'Nilgiris District, Tamil Nadu 643001',
      coordinates: [76.6950, 11.4102]
    },
    images: [
      { url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800', alt: 'Ooty Nilgiri Mountains' },
      { url: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?w=800', alt: 'Tea plantation Ooty' }
    ],
    category: 'Hill Station',
    activities: ['Toy Train Ride', 'Tea Factory Tasting', 'Trekking Doddabetta Peak', 'Boating on Ooty Lake'],
    bestTimeToVisit: 'March to June & September to November',
    estimatedBudget: 'Mid-range',
    duration: '2-3 days',
    travelTips: 'Book the Nilgiri Mountain Railway ticket well in advance for vintage steam engine romance.',
    nearbyPlaces: ['Doddabetta Peak', 'Botanical Garden', 'Pykara Falls', 'Coonoor'],
    rating: 4.7,
    reviewCount: 290,
    featured: false,
    popular: true
  },
  {
    name: 'Udaipur City of Lakes',
    description: 'Surrounded by the Aravalli Hills, Udaipur is renowned for its romantic marble palaces, shimmering Lake Pichola, and royal Rajput heritage.',
    shortDescription: 'Venice of the East with fairy-tale lakeside palaces',
    country: 'India',
    state: 'Rajasthan',
    city: 'Udaipur',
    location: {
      address: 'City Palace Complex, Udaipur, Rajasthan 313001',
      coordinates: [73.6835, 24.5764]
    },
    images: [
      { url: 'https://images.unsplash.com/photo-1607231350221-d7f39b73cf57?w=800', alt: 'Lake Pichola Palace' },
      { url: 'https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?w=800', alt: 'Udaipur Fort' }
    ],
    category: 'Heritage',
    activities: ['Lake Pichola Boat Cruise', 'City Palace Museum', 'Bagore Ki Haveli Folk Dance', 'Rooftop Dining'],
    bestTimeToVisit: 'September to March',
    estimatedBudget: 'Luxury',
    duration: '2-4 days',
    travelTips: 'Catch the Dharohar cultural dance show in the evening at Bagore Ki Haveli.',
    nearbyPlaces: ['Lake Palace', 'Jagmandir Island', 'Monsoon Palace', 'Fateh Sagar Lake'],
    rating: 4.9,
    reviewCount: 310,
    featured: true,
    popular: true
  },
  {
    name: 'Rishikesh Adventure & Yoga Capital',
    description: 'Located at the foothills of the Himalayas where the holy Ganges emerges into the plains. Globally celebrated as the Yoga Capital of the World and India\'s adventure epicenter.',
    shortDescription: 'World capital of yoga, meditation, and white-water river rafting',
    country: 'India',
    state: 'Uttarakhand',
    city: 'Rishikesh',
    location: {
      address: 'Lakshman Jhula, Rishikesh, Uttarakhand 249192',
      coordinates: [78.3247, 30.1259]
    },
    images: [
      { url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800', alt: 'Rishikesh Ganges suspension bridge' },
      { url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800', alt: 'Rishikesh valley' }
    ],
    category: 'Adventure',
    activities: ['White Water Rafting', 'Bungee Jumping', 'Yoga & Meditation Retreats', 'Ganga Beach Camping'],
    bestTimeToVisit: 'February to May & September to November',
    estimatedBudget: 'Budget',
    duration: '2-4 days',
    travelTips: 'Try cliff jumping during river rafting from Marine Drive to Shivpuri.',
    nearbyPlaces: ['Lakshman Jhula', 'Triveni Ghat Aarti', 'Beatles Ashram', 'Neelkanth Mahadev Temple'],
    rating: 4.8,
    reviewCount: 275,
    featured: true,
    popular: true
  },
  {
    name: 'Hampi Vijayanagara Ruins',
    description: 'A UNESCO World Heritage site dotted with 500+ ancient monuments, boulder-strewn hills, and royal temple complexes of the 14th-century Vijayanagara Empire.',
    shortDescription: 'Boulder-strewn capital of the historic Vijayanagara Empire',
    country: 'India',
    state: 'Karnataka',
    city: 'Hampi',
    location: {
      address: 'Hampi Heritage Zone, Vijayanagara, Karnataka 583239',
      coordinates: [76.4600, 15.3350]
    },
    images: [
      { url: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=800', alt: 'Hampi Stone Chariot' },
      { url: 'https://images.unsplash.com/photo-1600100397608-f010e42f9b87?w=800', alt: 'Virupaksha Temple' }
    ],
    category: 'Historical',
    activities: ['Stone Chariot Exploration', 'Coracle Boat Ride on Tungabhadra', 'Sunset at Matanga Hill', 'Bouldering'],
    bestTimeToVisit: 'October to March',
    estimatedBudget: 'Mid-range',
    duration: '2-3 days',
    travelTips: 'Rent a bicycle or moped to easily explore both sides of the Tungabhadra river.',
    nearbyPlaces: ['Virupaksha Temple', 'Vitthala Temple', 'Lotus Mahal', 'Elephant Stables', 'Anjaneya Hill'],
    rating: 4.9,
    reviewCount: 340,
    featured: true,
    popular: true
  },
  {
    name: 'Munnar Emerald Hills',
    description: 'Sprawling carpet of lush green tea estates, misty mountain valleys, and cool crisp air in the Western Ghats of Kerala.',
    shortDescription: 'Lush tea plantations, misty valleys, and cool mountain weather',
    country: 'India',
    state: 'Kerala',
    city: 'Munnar',
    location: {
      address: 'Idukki District, Munnar, Kerala 685612',
      coordinates: [77.0595, 10.0889]
    },
    images: [
      { url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800', alt: 'Munnar Tea Gardens' },
      { url: 'https://images.unsplash.com/photo-1571536802807-30451e3955d8?w=800', alt: 'Munnar Misty Hills' }
    ],
    category: 'Hill Station',
    activities: ['Tea Tasting & Factory Tours', 'Anamudi Peak Trekking', 'Boating in Mattupetty Dam', 'Campfire at Top Station'],
    bestTimeToVisit: 'September to March',
    estimatedBudget: 'Mid-range',
    duration: '2-4 days',
    travelTips: 'Visit Eravikulam National Park early in the morning to spot the endangered Nilgiri Tahr.',
    nearbyPlaces: ['Eravikulam National Park', 'Mattupetty Dam', 'Top Station', 'Attukad Waterfalls'],
    rating: 4.8,
    reviewCount: 410,
    featured: true,
    popular: true
  },
  {
    name: 'Leh-Ladakh Land of High Passes',
    description: 'A breathtaking high-altitude Himalayan desert with sapphire-blue lakes, ancient Buddhist gompas, and dramatic mountain passes.',
    shortDescription: 'Pristine high-altitude alpine lakes, monasteries, and rugged passes',
    country: 'India',
    state: 'Ladakh',
    city: 'Leh',
    location: {
      address: 'Leh City, Ladakh 194101',
      coordinates: [77.5771, 34.1526]
    },
    images: [
      { url: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=800', alt: 'Pangong Tso Lake' },
      { url: 'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?w=800', alt: 'Thiksey Monastery' }
    ],
    category: 'Adventure',
    activities: ['Pangong Tso Camping', 'Khardung La Pass Driving', 'Monastery Morning Chants', 'River Rafting in Zanskar'],
    bestTimeToVisit: 'May to September',
    estimatedBudget: 'Premium',
    duration: '5-7 days',
    travelTips: 'Acclimatize in Leh for at least 48 hours before traveling to higher elevations like Khardung La.',
    nearbyPlaces: ['Pangong Tso', 'Nubra Valley', 'Thiksey Monastery', 'Magnetic Hill', 'Shanti Stupa'],
    rating: 4.9,
    reviewCount: 520,
    featured: true,
    popular: true
  },
  {
    name: 'Darjeeling Queen of the Hills',
    description: 'Nestled beneath the majestic peaks of Kanchenjunga, world-renowned for its aromatic orthodox tea estates, colonial heritage, and Himalayan Toy Train.',
    shortDescription: 'World-famous tea gardens, Kanchenjunga sunrises, and heritage toy train',
    country: 'India',
    state: 'West Bengal',
    city: 'Darjeeling',
    location: {
      address: 'The Mall, Darjeeling, West Bengal 734101',
      coordinates: [88.2663, 27.0410]
    },
    images: [
      { url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800', alt: 'Darjeeling Hills' },
      { url: 'https://images.unsplash.com/photo-1582650625119-3a31f8418b7d?w=800', alt: 'Toy Train' }
    ],
    category: 'Hill Station',
    activities: ['Tiger Hill Sunrise View', 'UNESCO Toy Train Joyride', 'Happy Valley Tea Tour', 'Mall Road Strolls'],
    bestTimeToVisit: 'October to December & March to May',
    estimatedBudget: 'Mid-range',
    duration: '2-4 days',
    travelTips: 'Book your Tiger Hill morning cab the day before to see the first sunlight hit Mount Kanchenjunga.',
    nearbyPlaces: ['Tiger Hill', 'Batasia Loop', 'Ghum Monastery', 'Peace Pagoda', 'Padmaja Naidu Zoo'],
    rating: 4.7,
    reviewCount: 360,
    featured: true,
    popular: true
  },
  {
    name: 'Coorg Scotland of India',
    description: 'Lush evergreen hills of Kodagu enveloped in aromatic coffee and spice plantations, misty waterfalls, and rich Kodava warrior culture.',
    shortDescription: 'Aromatic coffee plantations, cascading waterfalls, and misty green hills',
    country: 'India',
    state: 'Karnataka',
    city: 'Madikeri',
    location: {
      address: 'Madikeri, Kodagu District, Karnataka 571201',
      coordinates: [75.7382, 12.4244]
    },
    images: [
      { url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800', alt: 'Coorg Coffee Forest' },
      { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', alt: 'Abbey Falls' }
    ],
    category: 'Nature',
    activities: ['Coffee Plantation Walk', 'Abbey Falls Trek', 'Elephant Bathing at Dubare', 'Namdroling Golden Temple Visit'],
    bestTimeToVisit: 'October to March',
    estimatedBudget: 'Mid-range',
    duration: '2-3 days',
    travelTips: 'Stay at an authentic coffee estate homestay for traditional homemade Kodava cuisine.',
    nearbyPlaces: ['Abbey Falls', 'Raja Seat', 'Dubare Elephant Camp', 'Namdroling Monastery', 'Talakaveri'],
    rating: 4.8,
    reviewCount: 395,
    featured: true,
    popular: true
  },
  {
    name: 'Jaisalmer Golden City & Thar Desert',
    description: 'Rising from the golden sands of the Thar Desert, boasting an ancient living sandstone fort, intricately carved havelis, and desert camel safaris.',
    shortDescription: 'Living golden sandstone fortress, desert dunes, and royal havelis',
    country: 'India',
    state: 'Rajasthan',
    city: 'Jaisalmer',
    location: {
      address: 'Fort Road, Jaisalmer, Rajasthan 345001',
      coordinates: [70.9167, 26.9157]
    },
    images: [
      { url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800', alt: 'Jaisalmer Golden Fort' },
      { url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800', alt: 'Thar Desert Dunes' }
    ],
    category: 'Heritage',
    activities: ['Sam Sand Dunes Camel Safari', 'Desert Stargazing & Camping', 'Jaisalmer Fort Walk', 'Patwon Ki Haveli Tour'],
    bestTimeToVisit: 'November to February',
    estimatedBudget: 'Mid-range',
    duration: '2-3 days',
    travelTips: 'Spend a night in Swiss luxury tents in Sam dunes to enjoy Rajasthani folk dances and Kalbelia music.',
    nearbyPlaces: ['Jaisalmer Fort', 'Patwon Ki Haveli', 'Sam Sand Dunes', 'Gadisar Lake', 'Kuldhara Ghost Village'],
    rating: 4.8,
    reviewCount: 330,
    featured: true,
    popular: true
  },
  {
    name: 'Amritsar Golden Temple',
    description: 'The spiritual and cultural center of the Sikh religion, home to the resplendent Harmandir Sahib covered in pure gold and the world-famous Wagah Border ceremony.',
    shortDescription: 'Sacred Golden Temple, community langar kitchen, and patriotic Wagah Border',
    country: 'India',
    state: 'Punjab',
    city: 'Amritsar',
    location: {
      address: 'Golden Temple Road, Amritsar, Punjab 143006',
      coordinates: [74.8765, 31.6200]
    },
    images: [
      { url: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800', alt: 'Golden Temple Harmandir Sahib' },
      { url: 'https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=800', alt: 'Golden Temple Night View' }
    ],
    category: 'Religious',
    activities: ['Harmandir Sahib Prayer Visit', 'Langar Community Dining', 'Wagah Border Beating Retreat', 'Jallianwala Bagh Memorial'],
    bestTimeToVisit: 'October to March',
    estimatedBudget: 'Budget',
    duration: '1-2 days',
    travelTips: 'Visit the Golden Temple at night when the illuminated golden dome reflects beautifully on the holy Amrit Sarovar.',
    nearbyPlaces: ['Harmandir Sahib', 'Wagah Border', 'Jallianwala Bagh', 'Partition Museum', 'Gobindgarh Fort'],
    rating: 4.9,
    reviewCount: 650,
    featured: true,
    popular: true
  },
  {
    name: 'Kodaikanal Princess of Hill Stations',
    description: 'Perched on the Palani Hills of Tamil Nadu, surrounded by tranquil star-shaped lakes, granite cliffs, pine forests, and scenic valley lookouts.',
    shortDescription: 'Star-shaped lake, misty pine forests, and dramatic granite cliffs',
    country: 'India',
    state: 'Tamil Nadu',
    city: 'Kodaikanal',
    location: {
      address: 'Kodaikanal Lake, Dindigul District, Tamil Nadu 624101',
      coordinates: [77.4892, 10.2381]
    },
    images: [
      { url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800', alt: 'Kodaikanal Lake' },
      { url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800', alt: 'Pine Forest' }
    ],
    category: 'Hill Station',
    activities: ['Pedal Boating in Kodai Lake', 'Pillar Rocks Viewpoint', 'Pine Forest Photography', 'Coakers Walk Promenade'],
    bestTimeToVisit: 'September to May',
    estimatedBudget: 'Mid-range',
    duration: '2-3 days',
    travelTips: 'Rent a bicycle around the 5 km perimeter of Kodaikanal Lake in the early morning.',
    nearbyPlaces: ['Kodaikanal Lake', 'Pillar Rocks', 'Coakers Walk', 'Silver Cascade Falls', 'Bryant Park'],
    rating: 4.7,
    reviewCount: 310,
    featured: true,
    popular: true
  }
];


const hotelData = [
  {
    name: 'The Oberoi Amarvilas Agra',
    description: 'Unmatched luxury located only 600 meters from the Taj Mahal. Every luxury room and suite offers uninterrupted vistas of the white marble monument.',
    shortDescription: 'World-renowned 5-star palace resort with private Taj Mahal views',
    city: 'Agra',
    state: 'Uttar Pradesh',
    location: {
      address: 'Taj East Gate Road, Tajganj, Agra, Uttar Pradesh 282001',
      coordinates: [78.0494, 27.1685]
    },
    images: [
      { url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', alt: 'Oberoi Amarvilas' },
      { url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', alt: 'Oberoi Pool and Garden' }
    ],
    rating: 4.9,
    reviewCount: 428,
    priceRange: 'Luxury',
    facilities: ['Free High-Speed Wi-Fi', 'Infinity Pool', 'Luxury Spa', 'Fine Dining Restaurant', 'Valet Parking', '24/7 Room Service', 'Fitness Center'],
    contactPhone: '+91 562 223 1515',
    contactEmail: 'reservations.amarvilas@oberoihotels.com',
    nearHighway: 'Yamuna Expressway',
    nearDestination: 'Taj Mahal',
    featured: true,
    rooms: [
      {
        roomType: 'Deluxe Room',
        roomImage: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
        description: 'Elegant Mughal-inspired room with king-size bed, marble bathroom, and direct view of the Taj Mahal.',
        maxGuests: 2,
        facilities: ['King Bed', 'Taj View Balcony', 'Bathtub', 'High-Speed Wi-Fi', 'Complimentary Breakfast', 'Mini Bar'],
        pricePerNight: 18500,
        isAvailable: true,
        totalRooms: 8
      },
      {
        roomType: 'Executive Suite',
        roomImage: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
        description: 'Expansive private suite with separate living parlor, open-air sun terrace, and personalized butler service.',
        maxGuests: 3,
        facilities: ['King Bed', 'Private Sun Terrace', 'Butler Service', 'Living Room', 'Deep Soaking Tub', 'Premium Audio'],
        pricePerNight: 32000,
        isAvailable: true,
        totalRooms: 4
      },
      {
        roomType: 'Presidential Suite',
        roomImage: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800',
        description: 'The pinnacle of royal grandeur with private dining hall, dressing suite, and panoramic Taj views.',
        maxGuests: 4,
        facilities: ['2 Master Bedrooms', 'Dining Room', 'Private Butler', 'Panoramic Terrace', 'Jacuzzi', 'VIP Airport Transfer'],
        pricePerNight: 65000,
        isAvailable: true,
        totalRooms: 2
      }
    ]
  },
  {
    name: 'Radisson Hotel Agra',
    description: 'Modern and vibrant hotel located conveniently on Fatehabad Road with quick expressway access and a scenic rooftop swimming pool.',
    shortDescription: 'Contemporary upscale hotel with rooftop pool and dining',
    city: 'Agra',
    state: 'Uttar Pradesh',
    location: {
      address: 'C-1, C-2, Fatehabad Road, Tajganj, Agra, Uttar Pradesh 282001',
      coordinates: [78.0380, 27.1610]
    },
    images: [
      { url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', alt: 'Radisson Hotel Agra' },
      { url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', alt: 'Radisson Pool' }
    ],
    rating: 4.6,
    reviewCount: 220,
    priceRange: 'Mid-range',
    facilities: ['Free Wi-Fi', 'Rooftop Swimming Pool', 'Multi-Cuisine Buffet', 'Spa & Fitness Center', 'Conference Facilities'],
    contactPhone: '+91 562 405 5555',
    contactEmail: 'info@radissonagra.com',
    nearHighway: 'Yamuna Expressway',
    nearDestination: 'Taj Mahal',
    featured: false,
    rooms: [
      {
        roomType: 'Standard Room',
        roomImage: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
        description: 'Comfortable air-conditioned king room with city skyline views, ergonomic work desk, and rain shower.',
        maxGuests: 2,
        facilities: ['Queen/Twin Beds', 'High-Speed Wi-Fi', 'Tea/Coffee Maker', 'LED TV', 'Rain Shower'],
        pricePerNight: 4800,
        isAvailable: true,
        totalRooms: 12
      },
      {
        roomType: 'Super Deluxe',
        roomImage: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
        description: 'Spacious corner room with plush seating area, luxury bathroom amenities, and buffet breakfast.',
        maxGuests: 3,
        facilities: ['King Bed', 'Complimentary Breakfast', 'Mini Fridge', 'Bathtub', 'City View'],
        pricePerNight: 7200,
        isAvailable: true,
        totalRooms: 6
      }
    ]
  },
  {
    name: 'Taj Exotica Resort & Spa Goa',
    description: 'Set in 56 manicured acres of lush gardens along pristine Benaulim Beach in South Goa. Features Mediterranean architecture and tranquil tropical luxury.',
    shortDescription: '5-star beachfront luxury haven on South Goa\'s golden sands',
    city: 'Benaulim',
    state: 'Goa',
    location: {
      address: 'Calwaddo, Benaulim, Salcete, Goa 403716',
      coordinates: [73.9317, 15.2471]
    },
    images: [
      { url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', alt: 'Taj Exotica Resort' },
      { url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', alt: 'Goa Beachfront' }
    ],
    rating: 4.9,
    reviewCount: 380,
    priceRange: 'Luxury',
    facilities: ['Private Beach Access', 'Jiva Ayurveda Spa', 'Free Wi-Fi', 'Golf Course', 'Multiple Specialty Restaurants', 'Kids Play Zone'],
    contactPhone: '+91 832 668 3333',
    contactEmail: 'exotica.goa@tajhotels.com',
    nearHighway: 'NH 66 Coastal Highway',
    nearDestination: 'Goa Coastal Paradise',
    featured: true,
    rooms: [
      {
        roomType: 'Deluxe Room',
        roomImage: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
        description: 'Airy garden-view villa room with private sit-out verandah, authentic Goan timber craft, and deep soaking tub.',
        maxGuests: 2,
        facilities: ['Private Verandah', 'Garden View', 'Deep Tub', 'Free Wi-Fi', 'Breakfast Included'],
        pricePerNight: 16000,
        isAvailable: true,
        totalRooms: 10
      },
      {
        roomType: 'Heritage Villa',
        roomImage: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
        description: 'Private plunge-pool villa situated right on the beachfront with direct ocean breeze and sunset panoramas.',
        maxGuests: 4,
        facilities: ['Private Plunge Pool', 'Beachfront View', 'Butler Service', 'Living Room', 'Outdoor Shower'],
        pricePerNight: 36000,
        isAvailable: true,
        totalRooms: 4
      }
    ]
  },
  {
    name: 'Sayaji Hotel Kolhapur',
    description: 'Premier upscale stopover on the Mumbai-Goa Highway (NH 48), famed for its opulent suites, warm hospitality, and rooftop restaurant.',
    shortDescription: 'Top highway luxury stopover between Mumbai and Goa',
    city: 'Kolhapur',
    state: 'Maharashtra',
    location: {
      address: 'Old Pune-Bangalore Highway, Kawala Naka, Kolhapur 416003',
      coordinates: [74.2500, 16.7020]
    },
    images: [
      { url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', alt: 'Sayaji Hotel Kolhapur' }
    ],
    rating: 4.7,
    reviewCount: 260,
    priceRange: 'Mid-range',
    facilities: ['Free High-Speed Wi-Fi', 'Swimming Pool', 'Bar & Lounge', 'Highway Parking', 'Gym', 'Buffet Breakfast'],
    contactPhone: '+91 231 255 5999',
    contactEmail: 'stay@sayajikolhapur.com',
    nearHighway: 'NH 48 Mumbai-Pune-Goa Corridor',
    nearDestination: 'Mahalakshmi Temple Kolhapur',
    featured: false,
    rooms: [
      {
        roomType: 'Standard Room',
        roomImage: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
        description: 'Well-appointed modern executive room with silent soundproofing, plush king bed, and fast room service.',
        maxGuests: 2,
        facilities: ['King Bed', 'Soundproofing', 'Free Wi-Fi', 'Breakfast Included', 'Work Desk'],
        pricePerNight: 4200,
        isAvailable: true,
        totalRooms: 15
      },
      {
        roomType: 'Executive Suite',
        roomImage: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
        description: 'Luxury suite with separate lounge area, whirlpool tub, and fruit basket upon arrival.',
        maxGuests: 3,
        facilities: ['Living Room', 'Whirlpool Tub', 'Free Wi-Fi', 'Minibar', 'City View'],
        pricePerNight: 7500,
        isAvailable: true,
        totalRooms: 5
      }
    ]
  },
  {
    name: 'Savoy - IHCL SeleQtions Ooty',
    description: 'Steeped in 180 years of history, Savoy Ooty transports guests back to a gracious bygone era of British colonial charm with working fireplaces and afternoon tea.',
    shortDescription: 'Colonial heritage palace hotel amidst 6 acres of Nilgiri gardens',
    city: 'Ooty',
    state: 'Tamil Nadu',
    location: {
      address: '77, Sylks Road, Ooty, Tamil Nadu 643001',
      coordinates: [76.7020, 11.4080]
    },
    images: [
      { url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', alt: 'Savoy Ooty' }
    ],
    rating: 4.8,
    reviewCount: 310,
    priceRange: 'Luxury',
    facilities: ['Working Fireplaces', 'Colonial Tea Lounge', 'Billiards Room', 'Free Wi-Fi', 'Spa', 'Lush Gardens'],
    contactPhone: '+91 423 222 5500',
    contactEmail: 'savoy.ooty@ihcltata.com',
    nearHighway: 'Bengaluru-Mysuru-Ooty Corridor',
    nearDestination: 'Ooty & Nilgiri Hills',
    featured: true,
    rooms: [
      {
        roomType: 'Standard Room',
        roomImage: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
        description: 'Cozy heritage cottage room with authentic teak wood furniture and scenic flower garden outlook.',
        maxGuests: 2,
        facilities: ['King Bed', 'Garden Outlook', 'Heater', 'Heritage Furniture', 'Breakfast'],
        pricePerNight: 12500,
        isAvailable: true,
        totalRooms: 8
      },
      {
        roomType: 'Executive Suite',
        roomImage: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
        description: 'Grand heritage suite featuring an operational wood fireplace, antique colonial artifacts, and personal attendant.',
        maxGuests: 3,
        facilities: ['Working Wood Fireplace', 'Private Garden Verandah', 'Antique Decor', 'Complimentary High Tea'],
        pricePerNight: 22000,
        isAvailable: true,
        totalRooms: 3
      }
    ]
  }
];

const feedbackData = [
  {
    userName: 'Aarav Sharma',
    userEmail: 'aarav.sharma@gmail.com',
    type: 'trip_review',
    category: 'Travel Experience',
    rating: 5,
    destination: 'Goa Coastal Paradise',
    hotelName: 'Taj Exotica Resort & Spa Goa',
    tripDate: '15 June 2026',
    comment: 'The smart route planning feature made our coastal road trip completely effortless! Discovered gorgeous waterfalls and quiet Konkan roadside restaurants along NH 66 that we never would have found on regular maps. 10/10 travel experience.'
  },
  {
    userName: 'Priya Patel',
    userEmail: 'priya.patel@outlook.com',
    type: 'trip_review',
    category: 'Booking Experience',
    rating: 5,
    destination: 'Taj Mahal, Agra',
    hotelName: 'The Oberoi Amarvilas Agra',
    tripDate: '10 July 2026',
    comment: 'Instant hotel booking with zero hassle! Selected our Deluxe Room facing the Taj Mahal and completed the payment securely using PhonePe in seconds. The booking confirmation was crystal clear.'
  },
  {
    userName: 'Vikram Sengupta',
    userEmail: 'vikram.s@yahoo.com',
    type: 'app_review',
    category: 'Route Accuracy',
    rating: 5,
    destination: 'Jaipur to Udaipur',
    hotelName: 'The Leela Palace Udaipur',
    tripDate: '2 August 2026',
    comment: 'The POI discovery along the route corridor is truly revolutionary. It clearly highlighted the Chittorgarh Fort detour and highway food courts with exact distances from our route.'
  },
  {
    userName: 'Ananya Deshmukh',
    userEmail: 'ananya.d@gmail.com',
    type: 'general_feedback',
    category: 'App Usability',
    rating: 5,
    comment: 'The AI Smart Tourist Guide is lightning fast! Asked it to plan a 3-day spiritual itinerary in Varanasi on a tight budget and it gave me the exact boat timings, ghat details, and street food gems.'
  },
  {
    userName: 'Rahul Nair',
    userEmail: 'rahul.nair@live.com',
    type: 'trip_review',
    category: 'Hotel Experience',
    rating: 4,
    destination: 'Ooty & Nilgiri Hills',
    hotelName: 'Savoy - IHCL SeleQtions Ooty',
    tripDate: '20 August 2026',
    comment: 'A magnificent heritage experience in the Nilgiris. The room with the wood-burning fireplace was cozy and the app\'s 24/7 support answered our route query regarding the Kallar Ghat hairpin bends immediately.'
  }
];

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('🔄 Cleaning existing collections...');
    await Destination.deleteMany();
    await User.deleteMany();
    await Hotel.deleteMany();
    await Booking.deleteMany();
    await Feedback.deleteMany();

    console.log('👤 Creating default users...');

    const regularUser = await User.create({
      name: 'Dinesh Kumar',
      email: 'traveler@touristguide.com',
      password: 'Traveler@123',
      role: 'user',
      preferences: {
        interests: ['Beach', 'Historical', 'Hill Station'],
        budget: 'Medium',
        travelStyle: 'Family'
      }
    });

    await User.create({
      name: 'Demo Traveler',
      email: 'user@example.com',
      password: 'User@123',
      role: 'user',
      preferences: {
        interests: ['Beach', 'Historical', 'Hill Station'],
        budget: 'Medium',
        travelStyle: 'Family'
      }
    });

    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@touristguide.com',
      password: 'Admin@123',
      role: 'admin'
    });

    await User.create({
      name: 'System Admin',
      email: 'admin@example.com',
      password: 'Admin@123',
      role: 'admin'
    });


    console.log('📍 Seeding Destinations...');
    destinationData.forEach(d => {
      d.slug = d.name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    });
    const createdDestinations = await Destination.insertMany(destinationData);
    console.log(`✅ Seeded ${createdDestinations.length} destinations.`);


    console.log('🏨 Seeding Hotels with Room Inventories...');
    const createdHotels = await Hotel.insertMany(hotelData);
    console.log(`✅ Seeded ${createdHotels.length} hotels with full rooms.`);

    console.log('🧳 Seeding Initial Completed Trips & Bookings for Demo Traveler...');
    const goaHotel = createdHotels.find(h => h.name.includes('Taj Exotica')) || createdHotels[0];
    const agraHotel = createdHotels.find(h => h.name.includes('Amarvilas')) || createdHotels[1];

    const pastCheckInGoa = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const pastCheckOutGoa = new Date(Date.now() - 11 * 24 * 60 * 60 * 1000);

    await Booking.create({
      bookingId: 'BK-2026-GOA772',
      userId: regularUser._id,
      hotelId: goaHotel._id,
      hotelName: goaHotel.name,
      hotelAddress: goaHotel.location.address,
      hotelCity: goaHotel.city,
      hotelImage: goaHotel.images[0].url,
      roomType: 'Deluxe Room',
      roomPricePerNight: 16000,
      checkInDate: pastCheckInGoa,
      checkOutDate: pastCheckOutGoa,
      guests: 2,
      roomsCount: 1,
      nights: 3,
      roomCost: 48000,
      taxAmount: 5760,
      totalAmount: 53760,
      paymentMethod: 'PhonePe',
      paymentStatus: 'Completed',
      transactionId: 'TXN-PHONEPE-9A4B8C1D-7721',
      bookingStatus: 'Completed',
      isCompletedTrip: true,
      tripSummary: 'A memorable three-day trip exploring Goa major beaches, historic Aguada Fort, and coastal seafood shacks.',
      placesVisited: ['Benaulim Beach', 'Aguada Fort', 'Dudhsagar Waterfalls', 'Fisherman Wharf']
    });

    const pastCheckInAgra = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000);
    const pastCheckOutAgra = new Date(Date.now() - 33 * 24 * 60 * 60 * 1000);

    await Booking.create({
      bookingId: 'BK-2026-AGR419',
      userId: regularUser._id,
      hotelId: agraHotel._id,
      hotelName: agraHotel.name,
      hotelAddress: agraHotel.location.address,
      hotelCity: agraHotel.city,
      hotelImage: agraHotel.images[0].url,
      roomType: 'Executive Suite',
      roomPricePerNight: 18500,
      checkInDate: pastCheckInAgra,
      checkOutDate: pastCheckOutAgra,
      guests: 2,
      roomsCount: 1,
      nights: 2,
      roomCost: 37000,
      taxAmount: 4440,
      totalAmount: 41440,
      paymentMethod: 'Google Pay',
      paymentStatus: 'Completed',
      transactionId: 'TXN-GPAY-4F8A2E-9932',
      bookingStatus: 'Completed',
      isCompletedTrip: true,
      tripSummary: 'An unforgettable weekend heritage journey along Yamuna Expressway exploring the magnificent Taj Mahal and Agra Fort.',
      placesVisited: ['Taj Mahal Monument', 'Agra Fort', 'Mehtab Bagh', 'Vrindavan Temples']
    });

    console.log('⭐ Seeding Ratings & Feedback...');
    await Feedback.insertMany(feedbackData);
    console.log(`✅ Seeded ${feedbackData.length} feedbacks.`);

    console.log('🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
};

seedDatabase();
