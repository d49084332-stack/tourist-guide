# 🌍 AI-Enabled Smart Tourist Guide & Personalized Travel Recommendation System (MERN Stack)

A complete, production-ready MERN stack web application for intelligent route planning, nearby place discovery, hotel reservations, secure multi-method payments, and personalized travel recommendations powered by Groq LLaMA 3.1 AI.

---

## 🌟 Core Features

### 1. 🗺️ Smart Route & Nearby Places Discovery
- **Turn-by-Turn Route Engine**: Enter any Starting Location and Destination (e.g. *Delhi ➔ Agra*, *Mumbai ➔ Goa*, *Bengaluru ➔ Ooty*, *Jaipur ➔ Udaipur*) to calculate total driving distance in kilometers, estimated travel duration in hours/minutes, primary highway information, and step-by-step navigation instructions.
- **Interactive Map**: Built with Leaflet, supporting interactive Street View and Satellite tile layers, dynamic route polyline rendering, and auto-fit zoom bounds.
- **Corridor POI Discovery**: Automatically discovers places situated along or near the highway route:
  - 🏨 **Hotels**: With immediate **“Book Now”** actions and prices.
  - 🛕 **Temples**: Prominent shrines along your route (Banke Bihari, Krishna Janmasthan, etc.).
  - 📍 **Tourist Attractions**: World Heritage monuments, waterfalls, and scenic viewpoints.
  - 🍴 **Restaurants**: Highway food courts, authentic dhabas, and coastal dining.
  - 🏛️ **Historical Places**: Red forts, palaces, and ancient ruins.
  - 🌳 **Parks**: National parks, tiger reserves, and botanical gardens.
  - ⭐ **Popular Landmarks**: Iconic viewpoints and cultural complexes.
- **Interactive Information Cards**: Distinctive category icons, traveler ratings, descriptions, images, and off-highway distances.

### 2. 🏨 Hotel Discovery & Instant Room Booking
- Prominent **“Book Now”** button on every hotel card along the route and in catalog search results.
- **Room Selection**:
  - Choose among available room types (*Standard Room*, *Deluxe Room*, *Executive Suite*, *Heritage Villa*).
  - Displays room images, descriptions, maximum guest allowances, amenities, price per night, and availability status.
- **Dynamic Booking Form**:
  - Select check-in date, check-out date, number of guests, and number of rooms.
  - Automatically calculates number of nights, base room charges, 12% GST/tourism taxes, and grand total amount.
  - **“Confirm Booking”** button proceeds directly to the secure payment modal.

### 3. 💳 Secure Multi-Method Payment Section
- **Supported Payment Gateways**:
  - 📱 **PhonePe**: Instant UPI ID validation & checkout.
  - 📱 **Google Pay**: GPay VPA verification.
  - 🔳 **Dynamic QR Code**: Live interactive simulated UPI QR code with real-time countdown timer.
  - 💳 **Credit Card**: Masked card input, name, expiry, CVV mock with 256-bit SSL encryption.
  - 💳 **Debit Card**: Direct banking debit with OTP simulation.
- **Security Compliance**: Never stores raw card numbers, CVVs, or UPI PINs in the database.
- **✅ Booking Confirmed Screen**:
  - Confetti celebration animation.
  - Unique Booking ID (`BK-2026-XXXX`), summary breakdown, and a direct button to view the reservation in the **Completed Trips** section.

### 4. ℹ️ Complete About Page (Critical Requirements Honored)
- **CRITICAL REQUIREMENT RESPECTED**: Completed Trips does **NOT** exist as a separate page, separate menu item, or separate route. It is placed strictly as a dedicated subsection inside `/about`.
- **A. About the App**: Explains purpose, AI recommendations, and route convenience.
- **B. Our Features**: 10 modern feature cards with smooth hover animations.
- **C. Completed Trips (Inside About Page Only)**:
  - Displays user's verified completed trips in cards: Destination, Travel Date, Places Visited, Hotel Booked, Summary, and Status.
  - Graceful empty state when no completed trips exist.
- **D. Ratings & Reviews (Inside About Page Only)**:
  - Overall rating (4.9 / 5.0) and total review count.
  - Star distribution progress bars (5-star, 4-star, 3-star, etc.).
  - Review input box and **Submit Review** button.
  - Verified user reviews feed with author name, trip/destination, and date.
- **E. User Feedback (Inside About Page Only)**:
  - Category selector (Travel Experience, Hotel Experience, Route Accuracy, App Usability, Booking, Payments, Suggestions).
  - Feedback textarea and 1-5 star rating.
  - Animated success confirmation message.
- **F. Why Choose Us**: 6 benefit cards (Easy Trip Planning, Smart Recommendations, Convenient Booking, Secure Payments, Complete Experience, 24/7 Support).
- **G. 24/7 Customer Support**:
  - Online Support: Live Chat, Help Center, Support Request ticket form.
  - Offline Support: Explicitly states *“Offline support is also available for face-to-face assistance”* with central assistance center addresses and telephone numbers.

### 5. 🤖 AI Smart Tourist Guide & Personalized Recommendations
- Powered by Groq API running `llama-3.1-8b-instant` with automatic resilient cascade fallback to `groq/compound-mini`.
- **Dedicated Chat Assistant (`/ai-assistant`)**:
  - Chat history sidebar, new chat creation, clear all chats.
  - Real-time message bubbles, typing indicators, auto-scroll to bottom.
  - Quick tourist inspiration chips (*Taj Mahal sunrise tips*, *Goa 3-day itinerary*, *Ooty family trip*).
- **AI Personalized Recommendations (`/recommendations`)**:
  - User preference selector for categories, budget, and travel style.
  - Neural AI compatibility percentage score for each destination.
- **Floating AI Assistant Widget**: Always-accessible floating assistant button across every screen.

### 6. 👤 User Profile & Admin Portal
- **Profile (`/profile`)**: Manage display name, account email, travel category preferences, budget tier, and view travel statistics.
- **Admin Dashboard (`/admin`)**: Analytics overview, destination catalog CRUD modal, bookings and gross revenue ledger, and feedback moderation.

---

## 🏗️ Project Structure

```
TOURIST GUIDE/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx               # Navigation bar (no separate Completed Trips link)
│   │   │   ├── Footer.jsx               # Footer with links and copyright
│   │   │   ├── InteractiveMap.jsx       # Real-time Leaflet map with route polyline & category markers
│   │   │   ├── HotelBookingModal.jsx    # Room inventory selection, night/tax calculations
│   │   │   ├── PaymentModal.jsx         # PhonePe, GPay, QR, Card checkout modal
│   │   │   ├── BookingSuccessModal.jsx  # Confirmed receipt modal with confetti & trip link
│   │   │   ├── FloatingAiChat.jsx       # Floating AI chatbot trigger & dialog
│   │   │   ├── DestinationCard.jsx      # Reusable destination card
│   │   │   ├── Common.jsx               # Button, Badge, Rating components
│   │   │   └── Loading.jsx              # Skeleton loaders and spinner
│   │   ├── pages/
│   │   │   ├── Home.jsx                 # Landing page (hero, features, AI demo preview, pricing, FAQ)
│   │   │   ├── About.jsx                # Dedicated About page with all required subsections
│   │   │   ├── Explore.jsx              # Search and category filtering
│   │   │   ├── DestinationDetails.jsx   # Full destination overview, gallery, reviews
│   │   │   ├── SmartRoutePlanner.jsx    # Smart Route & Corridor Places discovery
│   │   │   ├── Recommendations.jsx      # AI neural preference matching
│   │   │   ├── Favorites.jsx            # Saved favorite destinations
│   │   │   ├── Profile.jsx              # User profile, preferences, and travel stats
│   │   │   ├── AiAssistant.jsx          # Full Groq LLaMA 3.1 AI chatbot with sidebar
│   │   │   ├── AdminDashboard.jsx       # Metrics, destination CRUD, bookings, feedback
│   │   │   └── NotFound.jsx             # 404 page
│   │   ├── services/
│   │   │   └── api.js                   # Axios client for all backend REST endpoints
│   │   ├── store/
│   │   │   ├── authStore.js             # User authentication state (Zustand)
│   │   │   └── themeStore.js            # Dark/light theme state (Zustand)
│   │   ├── App.jsx                      # App router and component mounting
│   │   └── index.css                    # Tailwind CSS & Leaflet map styling
│   ├── .env                             # Client environment config
│   └── package.json
│
├── server/
│   ├── config/
│   │   └── database.js                  # MongoDB Mongoose connection
│   ├── controllers/
│   │   ├── authController.js            # Register, login, profile
│   │   ├── destinationController.js     # Destination listing, details, CRUD
│   │   ├── hotelController.js           # Hotel search and room inventory
│   │   ├── bookingController.js         # Booking creation, payment verification, trips
│   │   ├── routeController.js           # Route calculation and POI discovery along corridor
│   │   ├── feedbackController.js        # App feedback, trip reviews, star distribution
│   │   ├── chatController.js            # Groq LLaMA 3.1 AI inference
│   │   └── adminController.js           # Admin metrics and moderation
│   ├── models/
│   │   ├── User.js                      # User schema with preferences and bcrypt hashing
│   │   ├── Destination.js               # Destination schema with geo-coordinates
│   │   ├── Hotel.js                     # Hotel schema with rooms array and pricing
│   │   ├── Booking.js                   # Booking schema with payment status & trip summary
│   │   ├── Feedback.js                  # User feedback & trip reviews
│   │   ├── Chat.js                      # Chat conversation history
│   │   └── Review.js                    # Destination user reviews
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── destinationRoutes.js
│   │   ├── hotelRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── routeRoutes.js
│   │   ├── feedbackRoutes.js
│   │   ├── chatRoutes.js
│   │   └── adminRoutes.js
│   ├── seed/
│   │   └── seedDatabase.js              # Seeds destinations, hotels, trips, and feedback
│   ├── tests/
│   │   └── apiTest.js                   # Automated 14-point API test suite
│   ├── app.js                           # Express application setup
│   ├── server.js                        # Server entry point
│   ├── .env                             # Server environment variables
│   └── package.json
└── README.md
```

---

## ⚙️ Setup & Installation

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB database (Atlas or local instance)
- Groq API Key

### 2. Environment Variables Configuration

**Server (`server/.env`):**
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.rdjkpiq.mongodb.net/
JWT_SECRET=replace-with-a-long-random-secret
NODE_ENV=development
CLIENT_URL=http://localhost:5173
GROQ_API_KEY=your-groq-api-key
```

**Client (`client/.env`):**
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_API_KEY=
```

### 3. Install Dependencies

**Server:**
```bash
cd server
npm install
```

**Client:**
```bash
cd client
npm install
```

### 4. Seed Database
To populate sample destinations, hotels, room inventories, completed trips, and traveler feedback:
```bash
cd server
node seed/seedDatabase.js
```

---

## 🚀 Running the Application

### 1. Start Backend Server
```bash
cd server
npm run dev
```
Backend will start on `http://localhost:5000`.

### 2. Start Frontend Client
```bash
cd client
npm run dev
```
Frontend will be accessible at `http://localhost:5173`.

---

## 🧪 Running Automated API Tests

Execute the comprehensive end-to-end API test suite:
```bash
cd server
node tests/apiTest.js
```

### Test Suite Coverage:
1. **Server Health Check** (`GET /health`)
2. **User Registration** (`POST /api/auth/register`)
3. **User Login & JWT Issuance** (`POST /api/auth/login`)
4. **User Profile Access** (`GET /api/user/profile`)
5. **Get Destinations Catalog** (`GET /api/destinations`)
6. **Get Destination Details by ID** (`GET /api/destinations/:id`)
7. **Smart Route Planning & Corridor Discovery** (`GET /api/routes/plan?start=Delhi&destination=Agra`)
8. **Hotels & Room Inventory** (`GET /api/hotels`)
9. **Create Booking with Secure Payment** (`POST /api/bookings`)
10. **Retrieve User Bookings** (`GET /api/bookings/my-bookings`)
11. **Mark Trip as Completed** (`PUT /api/bookings/:id/complete-trip`)
12. **Submit Traveler Review & Feedback** (`POST /api/feedback`)
13. **Fetch Ratings Distribution & Feedbacks** (`GET /api/feedback`)
14. **Groq LLaMA 3.1 8B Tourist Guide AI Inference** (`POST /api/chat/message`)

---

## 🌐 Production Deployment

### Frontend (Vercel / Netlify / Cloudflare Pages)
1. Build the production bundle:
   ```bash
   cd client
   npm run build
   ```
2. Set the environment variable `VITE_API_BASE_URL` to your production backend URL.
3. Deploy the `client/dist` directory.

### Backend (Render / Railway / AWS / DigitalOcean)
1. Set the production environment variables (`MONGO_URI`, `JWT_SECRET`, `GROQ_API_KEY`, `CLIENT_URL`, `PORT`).
2. Start the server using:
   ```bash
   node server.js
   ```

---

## 🔑 Default Demonstration Accounts

- **Registered Traveler**:
  - Email: `traveler@touristguide.com`
  - Password: `Traveler@123`
- **System Administrator**:
  - Email: `admin@touristguide.com`
  - Password: `Admin@123`
#   t o u r i s t - g u i d e 
 
 #   t o u r i s t - g u i d e 
 
 #   t o u r i s t - g u i d e  
 #   t o u r i s t - g u i d e  
 #   t o u r i s t - g u i d e  
 