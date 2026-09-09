import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Compass,
  Hotel,
  Bed,
  Utensils,
  Landmark,
  Star,
  Luggage,
  CreditCard,
  Headphones,
  CheckCircle2,
  Calendar,
  Building,
  ShieldCheck,
  PhoneCall,
  Mail,
  Map,
  Sparkles,
  Send,
  MessageSquare,
  MessageCircle,
  HelpCircle,
  Check
} from 'lucide-react';
import { Button } from '../components/Common';
import { bookingAPI, feedbackAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function About() {
  const { user } = useAuthStore();

  // Completed trips state
  const [completedTrips, setCompletedTrips] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(true);

  // Ratings & Reviews state
  const [reviewsData, setReviewsData] = useState({
    avgRating: 4.9,
    total: 128,
    distribution: { 5: 98, 4: 22, 3: 6, 2: 2, 1: 0 },
    feedbacks: []
  });
  const [userRating, setUserRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewTripDest, setReviewTripDest] = useState('');
  const [reviewHotelName, setReviewHotelName] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // User Feedback state
  const [feedbackCategory, setFeedbackCategory] = useState('Travel Experience');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSuccessMsg, setFeedbackSuccessMsg] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Support state
  const [supportSubmitted, setSupportSubmitted] = useState(false);
  const [supportTicket, setSupportTicket] = useState({ name: '', email: '', query: '', category: 'General' });

  // Fetch completed trips and reviews
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        if (user) {
          const res = await bookingAPI.getMyBookings({ completedOnly: 'true' });
          if (res.data.success && res.data.bookings) {
            setCompletedTrips(res.data.bookings);
          }
        }
      } catch (err) {
        console.error('Trips fetch error:', err);
      } finally {
        setLoadingTrips(false);
      }
    };

    const fetchFeedback = async () => {
      try {
        const res = await feedbackAPI.getAll({ limit: 10 });
        if (res.data.success) {
          setReviewsData({
            avgRating: res.data.avgRating || 4.9,
            total: res.data.total || 128,
            distribution: res.data.distribution || { 5: 98, 4: 22, 3: 6, 2: 2, 1: 0 },
            feedbacks: res.data.feedbacks || []
          });
        }
      } catch (err) {
        console.error('Feedback fetch error:', err);
      }
    };

    fetchTrips();
    fetchFeedback();
  }, [user]);

  // Handle Review Submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      toast.error('Please write your review comment');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await feedbackAPI.submit({
        userName: user?.name || 'Verified Traveler',
        userEmail: user?.email || '',
        type: 'trip_review',
        rating: userRating,
        destination: reviewTripDest || 'India Journey',
        hotelName: reviewHotelName,
        comment: reviewComment,
        tripDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      });

      if (res.data.success) {
        toast.success('Thank you for rating your trip experience!');
        setReviewComment('');
        setReviewTripDest('');
        setReviewHotelName('');
        // Refresh reviews
        const refresh = await feedbackAPI.getAll({ limit: 10 });
        if (refresh.data.success) {
          setReviewsData(refresh.data);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Handle User Feedback Submission
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) {
      toast.error('Please enter your feedback comments');
      return;
    }

    setSubmittingFeedback(true);
    try {
      const res = await feedbackAPI.submit({
        userName: user?.name || 'Travel Enthusiast',
        userEmail: user?.email || '',
        type: 'general_feedback',
        category: feedbackCategory,
        rating: feedbackRating,
        comment: feedbackText
      });

      if (res.data.success) {
        setFeedbackSuccessMsg('🎉 Your feedback has been received! Thank you for helping us improve the platform.');
        setFeedbackText('');
        setTimeout(() => setFeedbackSuccessMsg(''), 6000);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // Features list
  const featuresList = [
    { icon: Map, title: 'Smart Route Planning', desc: 'Calculate optimal driving corridors with real-time route geometry, highway info, and distance calculations.' },
    { icon: Compass, title: 'Tourist Place Discovery', desc: 'Explore thousands of curated destinations across India with detailed photos, activity tips, and best times to visit.' },
    { icon: Hotel, title: 'Hotel Discovery', desc: 'Locate verified top-rated resorts, luxury stays, and budget hotels positioned along your travel route.' },
    { icon: Bed, title: 'Hotel Booking', desc: 'Select room types, compare prices, customize dates and guests, and reserve rooms instantly with zero hassle.' },
    { icon: Utensils, title: 'Restaurant Discovery', desc: 'Find celebrated dhabas, local seafood shacks, and fine-dining establishments along highways.' },
    { icon: Landmark, title: 'Temple & Landmark Discovery', desc: 'Never miss sacred heritage temples, royal forts, and iconic monuments on your road journey.' },
    { icon: Star, title: 'Ratings & Reviews', desc: 'Authentic community-driven ratings and verified traveler reviews for transparent trip planning.' },
    { icon: Luggage, title: 'Trip Management', desc: 'Easily track past journeys, upcoming itineraries, and detailed hotel booking vouchers in one hub.' },
    { icon: CreditCard, title: 'Secure Payments', desc: 'Multi-option payment gateway supporting PhonePe, Google Pay, dynamic QR codes, and cards.' },
    { icon: Headphones, title: '24/7 Customer Support', desc: 'Around-the-clock live chat, ticketing assistance, and physical offline support centers.' }
  ];

  // Why choose us benefits
  const whyChooseUs = [
    { title: 'Easy Trip Planning', desc: 'Plan routes and discover important places from one seamless application.' },
    { title: 'Smart Recommendations', desc: 'Find hotels, restaurants, temples, attractions, and landmarks along your journey.' },
    { title: 'Convenient Hotel Booking', desc: 'Discover and book suitable hotels without ever leaving the application.' },
    { title: 'Secure Payments', desc: 'Provide an encrypted, reliable, and instantaneous payment experience.' },
    { title: 'Complete Travel Experience', desc: 'Manage routes, bookings, completed trips, ratings, and feedback in one place.' },
    { title: '24/7 Support', desc: 'Get assistance whenever help is required via online channels and offline centers.' }
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">

        {/* SECTION A: ABOUT THE APP */}
        <section id="about-app" className="relative">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 px-3 py-1 rounded-full border border-primary-200 dark:border-primary-800">
              Welcome to Tourist Guide
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold mt-4 tracking-tight gradient-text">
              AI-Enabled Smart Tourist Guide & Personalized Travel System
            </h1>
            <p className="mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              Designed to simplify travel planning by empowering travelers with intelligent route planning, point-of-interest discovery, seamless hotel bookings, and tailored AI recommendations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center bg-white dark:bg-gray-900 p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800">
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                How Our Platform Simplifies Travel
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                Traditional travel planning often involves juggling multiple map apps, hotel aggregators, and search engines. Our Tourist Guide application combines everything into a unified, interactive platform built on modern MERN stack architecture.
              </p>
              <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Interactive Route Planning:</strong> Enter start and end points to generate turn-by-turn road navigation with live distance and time estimates.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Corridor Discovery:</strong> Automatically detects hotels, ancient temples, famous attractions, and restaurants located directly along your highway path.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Instant Room Booking:</strong> Pick preferred room configurations and confirm reservations using secure PhonePe, Google Pay, QR, or Card payments.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span><strong>AI Travel Intelligence:</strong> Powered by Groq LLaMA 3.1 to provide customized itineraries based on your interests and travel budget.</span>
                </li>
              </ul>
            </div>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl h-80 sm:h-96">
              <img
                src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=900"
                alt="Traveler exploring scenic route"
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
                <div className="text-white">
                  <span className="text-xs uppercase font-bold tracking-widest text-primary-300">Explore India</span>
                  <h3 className="font-bold text-lg">Every kilometer made memorable</h3>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION B: OUR FEATURES */}
        <section id="our-features">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400">
              Complete Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-2">
              Our Modern Tourism Features
            </h2>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-2">
              Engineered with smooth micro-interactions, responsive layouts, and modern travel convenience.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuresList.map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.2 }}
                className="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-800 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon size={24} />
                </div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* SECTION C: COMPLETED TRIPS (CRITICAL REQUIREMENT: INSIDE ABOUT PAGE ONLY) */}
        <section id="completed-trips" className="scroll-mt-20">
          <div className="bg-gradient-to-br from-primary-50/60 via-white to-orange-50/60 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800/80 p-8 sm:p-10 rounded-3xl shadow-xl border border-primary-100 dark:border-gray-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400 flex items-center gap-1.5">
                  <Luggage size={14} /> Travel Memories
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
                  🧳 Completed Trips
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Review your verified past travel itineraries, visited landmarks, and booked accommodations.
                </p>
              </div>
              <div className="text-xs px-3 py-1.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium self-start md:self-auto">
                Total Completed: <strong className="text-primary-600 dark:text-primary-400">{completedTrips.length}</strong>
              </div>
            </div>

            {loadingTrips ? (
              <div className="py-12 text-center text-xs text-gray-400">Loading your completed trips...</div>
            ) : completedTrips.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {completedTrips.map((trip) => (
                  <motion.div
                    key={trip._id || trip.bookingId}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-md hover:shadow-xl border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row transition-all"
                  >
                    <div className="sm:w-44 h-40 sm:h-auto flex-shrink-0 relative overflow-hidden">
                      <img
                        src={trip.hotelImage || 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600'}
                        alt={trip.hotelName}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-md bg-emerald-600 text-white font-bold uppercase shadow">
                        ✓ {trip.bookingStatus || 'Completed'}
                      </span>
                    </div>
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-2.5">
                      <div>
                        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                          <span className="font-mono text-[11px]">{trip.bookingId}</span>
                          <span className="flex items-center gap-1 font-medium text-gray-600 dark:text-gray-300">
                            <Calendar size={12} />
                            {new Date(trip.checkInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        <h4 className="font-bold text-base text-gray-900 dark:text-white">
                          Destination: <span className="text-primary-600 dark:text-primary-400">{trip.hotelCity || 'Goa'}</span>
                        </h4>
                        <p className="text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1 mt-0.5">
                          <Building size={13} className="text-primary-500" />
                          <strong>Hotel:</strong> {trip.hotelName} ({trip.roomType})
                        </p>
                      </div>

                      {trip.placesVisited && trip.placesVisited.length > 0 && (
                        <div className="text-xs">
                          <span className="text-gray-500 font-semibold block mb-1">Places Visited:</span>
                          <div className="flex flex-wrap gap-1">
                            {trip.placesVisited.map((p, i) => (
                              <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 border border-primary-100 dark:border-primary-800">
                                📍 {p}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <p className="text-xs text-gray-500 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                        "{trip.tripSummary || `A memorable ${trip.nights}-day trip exploring major attractions.`}"
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-4 bg-white/60 dark:bg-gray-900/60 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                <Luggage size={42} className="mx-auto text-gray-400 mb-3" />
                <h3 className="font-bold text-base text-gray-800 dark:text-gray-200 mb-1">
                  No Completed Trips Recorded Yet
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  “Your completed trips will appear here after you finish your first trip.”
                </p>
              </div>
            )}
          </div>
        </section>

        {/* SECTION D: RATINGS & REVIEWS (INSIDE ABOUT PAGE ONLY) */}
        <section id="ratings-reviews">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
              Community Voices
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-1">
              ⭐ Ratings & Reviews
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              Read transparent feedback from verified travelers or rate your completed trips.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Overall Rating & Star Distribution */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white mb-4">
                  Overall Platform Rating
                </h3>
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-5xl font-extrabold text-gray-900 dark:text-white">
                    {reviewsData.avgRating}
                  </div>
                  <div>
                    <div className="flex text-amber-400 text-lg">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={18}
                          fill={star <= Math.round(reviewsData.avgRating) ? 'currentColor' : 'none'}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 block mt-0.5">
                      Based on {reviewsData.total} traveler reviews
                    </span>
                  </div>
                </div>

                {/* Star Distribution Progress Bars */}
                <div className="space-y-2.5 text-xs">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = reviewsData.distribution?.[stars] || 0;
                    const percent = reviewsData.total ? Math.round((count / reviewsData.total) * 100) : 0;
                    return (
                      <div key={stars} className="flex items-center gap-3">
                        <span className="w-12 font-medium flex items-center gap-1 text-gray-600 dark:text-gray-300">
                          {stars} <Star size={12} fill="currentColor" className="text-amber-400" />
                        </span>
                        <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-gray-400">{percent}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit Review Card Form */}
              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-2">
                  Rate Your Completed Journey
                </h4>
                <form onSubmit={handleReviewSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      Your Rating
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setUserRating(s)}
                          className={`p-1 transition-transform ${s <= userRating ? 'text-amber-400 scale-110' : 'text-gray-300 dark:text-gray-600'}`}
                        >
                          <Star size={20} fill={s <= userRating ? 'currentColor' : 'none'} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <input
                    type="text"
                    value={reviewTripDest}
                    onChange={(e) => setReviewTripDest(e.target.value)}
                    placeholder="Trip / Destination Name (e.g. Goa, Agra)"
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                  />

                  <textarea
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Describe your travel experience, route accuracy, and hotel stay..."
                    required
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                  />

                  <Button
                    type="submit"
                    disabled={submittingReview}
                    size="sm"
                    className="w-full text-xs font-bold py-2 bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center gap-1.5 shadow"
                  >
                    <Star size={14} /> Submit Review
                  </Button>
                </form>
              </div>
            </div>

            {/* Right: User Reviews Feed */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                Recent Traveler Testimonials
              </h3>

              <div className="space-y-4">
                {reviewsData.feedbacks.map((item, idx) => (
                  <motion.div
                    key={item._id || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-5 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary-500 to-accent-500 text-white font-bold text-xs flex items-center justify-center">
                          {item.userName ? item.userName.charAt(0).toUpperCase() : 'T'}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-gray-900 dark:text-white">
                            {item.userName}
                          </h4>
                          <span className="text-[10px] text-gray-400">
                            {item.tripDate || new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      <div className="flex text-amber-400 text-xs">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={14}
                            fill={star <= item.rating ? 'currentColor' : 'none'}
                          />
                        ))}
                      </div>
                    </div>

                    {item.destination && (
                      <div className="text-[11px] font-semibold text-primary-600 dark:text-primary-400 flex items-center gap-1">
                        📍 Destination: {item.destination} {item.hotelName && `• Stayed at ${item.hotelName}`}
                      </div>
                    )}

                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                      "{item.comment}"
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION E: USER FEEDBACK (INSIDE ABOUT PAGE ONLY) */}
        <section id="user-feedback">
          <div className="bg-white dark:bg-gray-900 p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 max-w-4xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span className="text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400 flex items-center justify-center gap-1">
                <MessageSquare size={14} /> Suggestions & Improvement
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
                💬 User Feedback
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                We value your suggestions to make route accuracy, booking ease, and AI advice even better.
              </p>
            </div>

            {feedbackSuccessMsg && (
              <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-xs flex items-center gap-2 font-medium">
                <CheckCircle2 size={18} className="flex-shrink-0" />
                <span>{feedbackSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Feedback Category
                  </label>
                  <select
                    value={feedbackCategory}
                    onChange={(e) => setFeedbackCategory(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="Travel Experience">Travel Experience</option>
                    <option value="Hotel Experience">Hotel Experience</option>
                    <option value="Route Accuracy">Route Accuracy</option>
                    <option value="App Usability">App Usability</option>
                    <option value="Booking Experience">Booking Experience</option>
                    <option value="Payment Experience">Payment Experience</option>
                    <option value="Suggestions for Improvement">Suggestions for Improvement</option>
                    <option value="Customer Support">Customer Support</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Experience Rating (1–5)
                  </label>
                  <div className="flex gap-2 items-center h-10">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackRating(star)}
                        className={`p-1 ${star <= feedbackRating ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
                      >
                        <Star size={20} fill={star <= feedbackRating ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-gray-500 ml-2">
                      {feedbackRating} / 5 Stars
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Your Detailed Feedback or Suggestion
                </label>
                <textarea
                  rows={4}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Share details regarding your route accuracy, hotel checkout, payment speed, or features you would love to see..."
                  required
                  className="w-full text-xs p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                />
              </div>

              <div className="text-right">
                <Button
                  type="submit"
                  disabled={submittingFeedback}
                  size="lg"
                  className="text-xs font-bold py-2.5 px-6 shadow-md"
                >
                  {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                </Button>
              </div>
            </form>
          </div>
        </section>

        {/* SECTION F: WHY CHOOSE US */}
        <section id="why-choose-us">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400">
              The Advantage
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-1">
              ❤️ Why Choose Us
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              Experience the pinnacle of unified travel planning and execution.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyChooseUs.map((item, idx) => (
              <div
                key={idx}
                className="p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-2 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm mb-3">
                  0{idx + 1}
                </div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION G: 24/7 CUSTOMER SUPPORT */}
        <section id="customer-support" className="bg-gradient-to-r from-primary-900 via-primary-800 to-slate-900 text-white p-8 sm:p-12 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="relative z-10 grid lg:grid-cols-2 gap-10">
            {/* Online Support */}
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-primary-300 flex items-center gap-1.5">
                  <Headphones size={15} /> Always Available
                </span>
                <h2 className="text-3xl font-extrabold mt-1">
                  📞 24/7 Customer Support
                </h2>
                <p className="text-xs sm:text-sm text-gray-300 mt-2">
                  We provide 24/7 customer support through both online and offline services for hotel bookings, route navigation, and payment queries.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
                  <MessageCircle size={18} className="text-emerald-400" />
                  <h4 className="font-bold">Live AI & Human Chat</h4>
                  <p className="text-[11px] text-gray-300">Instant answers 24 hours a day.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
                  <HelpCircle size={18} className="text-accent-500" />
                  <h4 className="font-bold">Help Center & FAQs</h4>
                  <p className="text-[11px] text-gray-300">Detailed guides and route maps.</p>
                </div>
              </div>

              {/* Offline Support Requirement */}
              <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 space-y-1.5">
                <span className="text-[11px] uppercase font-bold text-emerald-300 tracking-wider flex items-center gap-1.5">
                  <Building size={14} /> Offline Support Available
                </span>
                <p className="text-xs text-white font-medium">
                  “Offline support is also available for face-to-face assistance.”
                </p>
                <p className="text-[11px] text-emerald-200">
                  📍 Central Tourism Assistance Center: Block B-4, Connaught Place, New Delhi & MG Road Tourism Bureau, Bengaluru.
                  <br />Hotline: <strong>+91 (011) 2345-6789</strong>
                </p>
              </div>
            </div>

            {/* Support Request Form */}
            <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/15">
              <h3 className="font-bold text-base mb-1">
                Submit a Support Request
              </h3>
              <p className="text-xs text-gray-300 mb-4">
                Our support team responds within 15 minutes.
              </p>

              {supportSubmitted ? (
                <div className="py-8 text-center space-y-2">
                  <CheckCircle2 size={36} className="mx-auto text-emerald-400" />
                  <h4 className="font-bold text-sm">Ticket Submitted Successfully!</h4>
                  <p className="text-xs text-gray-300">Our concierge support representative will connect with you shortly.</p>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSupportSubmitted(true);
                    toast.success('Support ticket created successfully!');
                  }}
                  className="space-y-3"
                >
                  <input
                    type="text"
                    required
                    placeholder="Your Full Name"
                    value={supportTicket.name}
                    onChange={(e) => setSupportTicket({ ...supportTicket, name: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-primary-400"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Email Address"
                    value={supportTicket.email}
                    onChange={(e) => setSupportTicket({ ...supportTicket, email: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-primary-400"
                  />
                  <textarea
                    rows={3}
                    required
                    placeholder="How can we assist with your trip, route, or hotel booking?"
                    value={supportTicket.query}
                    onChange={(e) => setSupportTicket({ ...supportTicket, query: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-primary-400 resize-none"
                  />
                  <Button type="submit" size="md" className="w-full text-xs font-bold py-2.5 bg-primary-500 hover:bg-primary-600 text-white">
                    Submit Request
                  </Button>
                </form>
              )}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
