import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  TrendingUp,
  Users,
  Map,
  Brain,
  MessageCircle,
  Navigation,
  Hotel,
  CreditCard,
  Headphones,
  Compass,
  Star,
  CheckCircle2,
  ArrowRight,
  Send,
  Bot
} from 'lucide-react';
import { Button, Badge } from '../components/Common';
import DestinationCard from '../components/DestinationCard';
import Accordion from '../components/Accordion';
import { LoadingSpinner, EmptyState, SkeletonCard } from '../components/Loading';
import { destinationAPI, chatAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function Home() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  // AI Demo Preview state on landing page
  const [demoInput, setDemoInput] = useState('Plan a 2-day road trip from Delhi to Agra with top temples and luxury hotels');
  const [demoResponse, setDemoResponse] = useState(
    'Here is your curated Delhi to Agra road trip via Yamuna Expressway:\n• Duration: ~3.5 hours driving (233 km)\n• En-route Temples: Banke Bihari & Prem Mandir in Vrindavan, Krishna Janmabhoomi in Mathura.\n• Must-Visit: Taj Mahal at sunrise, Agra Fort, Mehtab Bagh.\n• Recommended Stays: The Oberoi Amarvilas (Taj views) or Radisson Hotel Agra.'
  );
  const [demoLoading, setDemoLoading] = useState(false);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await destinationAPI.getAll({ limit: 6 });
        if (response.data.success) {
          setDestinations(response.data.destinations);
        }
      } catch (error) {
        console.error('Failed to load destinations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  const handleRunAiDemo = async (e) => {
    e.preventDefault();
    if (!demoInput.trim() || demoLoading) return;
    setDemoLoading(true);

    try {
      const res = await chatAPI.sendMessage({ message: demoInput });
      if (res.data.success) {
        setDemoResponse(res.data.message);
      } else {
        toast.error('AI response temporarily unavailable');
      }
    } catch (err) {
      console.error('Demo AI error:', err);
      toast.error('Could not connect to Groq AI service');
    } finally {
      setDemoLoading(false);
    }
  };

  const faqItems = [
    {
      title: 'How does the Smart Route Planning and POI discovery work?',
      content: 'When you specify your starting location and destination, our routing engine plots the exact highway polyline and automatically detects hotels, temples, restaurants, historical landmarks, and parks situated along that specific highway corridor.'
    },
    {
      title: 'How does the Hotel Booking & Secure Payment flow operate?',
      content: 'Every hotel discovered along your route offers a direct "Book Now" option. You can inspect available room categories (Deluxe, Executive Suite, Heritage Villa), select travel dates and guests, and pay securely using PhonePe, Google Pay, dynamic UPI QR codes, or credit/debit cards.'
    },
    {
      title: 'Where can I find my Completed Trips?',
      content: 'Per our unified architecture, your Completed Trips are displayed exclusively as an attractive dedicated subsection inside the About page (/about). You can review all past trip summaries, hotels stayed, and visited places in one place.'
    },
    {
      title: 'Which AI model powers the Tourist Guide chatbot?',
      content: 'Our platform is integrated with Groq\'s high-speed inference engine running LLaMA 3.1 8B Instant, providing instant personalized itineraries, budget breakdowns, and regional tourism advice.'
    },
    {
      title: 'What customer support is provided?',
      content: 'We provide 24/7 customer support via online live chat, ticketing, and dedicated offline face-to-face assistance centers in New Delhi and Bengaluru.'
    }
  ];

  const features = [
    {
      icon: Navigation,
      title: '🗺️ Smart Route Planning',
      description: 'Interactive map navigation with real-time distance, travel duration, highway guidelines, and step-by-step directions.'
    },
    {
      icon: Hotel,
      title: '🏨 Hotel Discovery & Booking',
      description: 'Discover luxury and budget accommodations along your route with room selection, transparent tax calculation, and instant booking.'
    },
    {
      icon: CreditCard,
      title: '💳 Secure Multi-Method Payments',
      description: 'Zero-friction checkout supporting PhonePe, Google Pay, dynamic QR codes, and 256-bit SSL encrypted credit and debit cards.'
    },
    {
      icon: Brain,
      title: '🤖 AI Smart Tourist Guide',
      description: 'Powered by Groq LLaMA 3.1 to provide responsive travel itineraries, regional cultural trivia, and customized road trip recommendations.'
    },
    {
      icon: Map,
      title: '📍 Corridor Places Discovery',
      description: 'Automatically discover historic temples, heritage forts, highway dhabas, and scenic viewpoints within driving distance of your path.'
    },
    {
      icon: Headphones,
      title: '📞 24/7 Customer Support',
      description: 'Around-the-clock online assistance and verified physical offline support centers for complete peace of mind.'
    }
  ];

  const pricingTiers = [
    {
      name: 'Explorer Pass',
      price: 'Free',
      period: 'Forever',
      description: 'Ideal for weekend road trippers and leisure explorers.',
      features: [
        'Interactive Smart Route Planning',
        'Corridor POI discovery along routes',
        'Real-time distance & duration calculation',
        'Direct hotel bookings & UPI payments',
        'Standard AI travel advice'
      ],
      cta: 'Get Started',
      popular: false
    },
    {
      name: 'Voyager Pro',
      price: '₹499',
      period: 'per year',
      description: 'For frequent road travelers seeking premium concierge benefits.',
      features: [
        'All Explorer Pass features included',
        'Unlimited Groq LLaMA 3.1 AI queries',
        'Priority 24/7 concierge & offline assistance',
        'Exclusive 10% discount on luxury hotel stays',
        'Offline PDF route itinerary downloads',
        'Verified trip review badges'
      ],
      cta: 'Upgrade to Pro',
      popular: true
    },
    {
      name: 'Heritage Enterprise',
      price: '₹1,999',
      period: 'per group',
      description: 'Tailored for corporate offsites, travel agencies, and large groups.',
      features: [
        'All Voyager Pro features included',
        'Custom multi-city corridor route mapping',
        'Group booking invoice & GST claiming',
        'Dedicated personal travel manager',
        'Custom corporate travel portal'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">

      {/* 1. HERO SECTION WITH ANIMATED HEADLINE */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-16 pb-20 bg-[#102a2b] text-white">
        <div className="absolute inset-0 hero-backdrop" />
        <div className="absolute inset-0 hero-grid opacity-40" />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.8, scale: 1 }}
          transition={{ duration: 1.2 }}
          className="absolute -right-24 top-24 h-72 w-72 rounded-full border border-[#ed6a20]/50"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-5 max-w-3xl"
          >
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest bg-[#ed6a20]/15 text-[#ffb06f] border border-[#ed6a20]/30">
              <Sparkles size={14} className="text-amber-400" /> AI-Enabled MERN Smart Tourist Platform
            </span>

            <h1 className="display-type text-5xl sm:text-7xl lg:text-8xl font-bold leading-[0.95]">
              Find the road that feels like yours.
            </h1>

            <p className="text-base sm:text-xl text-white/75 max-w-2xl leading-relaxed">
              Experience the next generation of tourism. Enter any route to map highway journeys, automatically discover hotels, temples, and dining along the corridor, reserve rooms instantly, and receive personalized AI guidance.
            </p>

            <div className="flex flex-col sm:flex-row gap-3.5 pt-4">
              <Link to="/travel-planner">
                <Button size="lg" className="w-full sm:w-auto font-bold shadow-xl flex items-center justify-center gap-2 bg-[#ed6a20] hover:bg-[#d95718] text-white">
                  <Navigation size={18} /> Plan Smart Route
                </Button>
              </Link>
              <Link to="/ai-assistant">
                <Button size="lg" variant="outline" className="w-full sm:w-auto font-bold flex items-center justify-center gap-2 border-white/40 text-white hover:bg-white/10">
                  <Bot size={18} className="text-primary-500" /> AI Tourist Guide
                </Button>
              </Link>
              <Link to="/explore">
                <Button size="lg" variant="outline" className="w-full sm:w-auto font-semibold flex items-center justify-center gap-2 border-white/40 text-white hover:bg-white/10">
                  <Compass size={18} /> Explore Destinations
                </Button>
              </Link>
            </div>
          </motion.div>

        </div>
      </section>

      {/* 2. FEATURES SHOWCASE */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400">
              Modern Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-2">
              All-In-One Smart Tourism System
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">
              Engineered with clean MVC architecture, interactive maps, secure payment processing, and responsive design.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -6 }}
                className="p-7 bg-white dark:bg-gray-950 rounded-3xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-800 transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <item.icon size={24} />
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400">
              User Experience Flow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-2">
              How the System Operates
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              From route planning to booking confirmation in 4 intuitive steps.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Enter Locations', desc: 'Specify starting location and destination to render the driving route.' },
              { step: '02', title: 'Discover Places', desc: 'Identify hotels, temples, dining, and landmarks along your road corridor.' },
              { step: '03', title: 'Reserve & Pay', desc: 'Pick room types and checkout securely via PhonePe, GPay, QR, or Card.' },
              { step: '04', title: 'Review in About', desc: 'Completed trips and reviews are automatically archived inside your About page.' }
            ].map((step, idx) => (
              <div
                key={idx}
                className="p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 text-center space-y-3 relative group"
              >
                <div className="w-12 h-12 rounded-full bg-primary-600 text-white font-extrabold text-sm flex items-center justify-center mx-auto shadow-md group-hover:scale-110 transition-transform">
                  {step.step}
                </div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. AI DEMO PREVIEW SECTION */}
      <section className="py-20 bg-gradient-to-br from-primary-50/70 via-white to-orange-50/70 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400 flex items-center justify-center gap-1.5">
              <Bot size={16} /> Live AI Demo
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-1">
              Experience the Smart Tourist Guide
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Ask any question below to test live inference via Groq LLaMA 3.1 8B.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8 space-y-4">
            <form onSubmit={handleRunAiDemo} className="flex gap-2">
              <input
                type="text"
                value={demoInput}
                onChange={(e) => setDemoInput(e.target.value)}
                placeholder="Ask about road trips, temples, or hotel recommendations..."
                className="flex-1 text-xs sm:text-sm p-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-medium focus:outline-none focus:border-primary-500"
              />
              <Button
                type="submit"
                disabled={demoLoading || !demoInput.trim()}
                size="md"
                className="px-5 font-bold text-xs sm:text-sm shadow-md"
              >
                {demoLoading ? 'Thinking...' : 'Ask AI'}
              </Button>
            </form>

            {/* AI Output Window */}
            <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 text-xs sm:text-sm leading-relaxed space-y-2">
              <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold text-xs">
                <Bot size={16} /> LLaMA 3.1 AI Response:
              </div>
              <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 font-sans">
                {demoResponse}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. POPULAR DESTINATIONS PREVIEW */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400">
                Trending In India
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold mt-1">
                Popular Tourist Destinations
              </h2>
            </div>
            <Link to="/explore">
              <Button variant="outline" size="sm" className="flex items-center gap-1 text-xs font-semibold">
                <span>View All Destinations</span> <ArrowRight size={14} />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : destinations.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {destinations.slice(0, 3).map((dest) => (
                <DestinationCard key={dest._id} destination={dest} />
              ))}
            </div>
          ) : (
            <EmptyState message="No destinations loaded" />
          )}
        </div>
      </section>

      {/* 6. PRICING CARDS */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400">
              Clear Value
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-2">
              Membership & Travel Passes
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Transparent options for every traveler. Always zero hidden fees.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {pricingTiers.map((tier, idx) => (
              <div
                key={idx}
                className={`p-8 rounded-3xl flex flex-col justify-between transition-all ${
                  tier.popular
                    ? 'bg-white dark:bg-gray-950 border-2 border-primary-500 shadow-2xl relative scale-105'
                    : 'bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 shadow-sm'
                }`}
              >
                {tier.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow">
                    Most Popular
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{tier.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{tier.description}</p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
                      {tier.price}
                    </span>
                    <span className="text-xs text-gray-400">{tier.period}</span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-gray-600 dark:text-gray-300 pt-2 border-t border-gray-100 dark:border-gray-800">
                    {tier.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6">
                  <Link to={user ? '/travel-planner' : '/register'} className="block">
                    <Button
                      size="md"
                      variant={tier.popular ? 'primary' : 'outline'}
                      className="w-full text-xs font-bold"
                    >
                      {tier.cta}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. TESTIMONIALS */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400">
              Traveler Reviews
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-2">
              Loved by Explorers Across India
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Aarav Sharma', role: 'Road Tripper', comment: 'The corridor discovery along the Mumbai to Goa highway was unbelievable! Found stunning hidden waterfalls and Konkan eateries without any guesswork.', rating: 5 },
              { name: 'Priya Patel', role: 'Heritage Traveler', comment: 'Instant booking at The Oberoi Amarvilas facing the Taj Mahal via PhonePe was completed in under a minute. Outstanding UI and animations.', rating: 5 },
              { name: 'Vikram Sengupta', role: 'Adventure Explorer', comment: 'The Groq LLaMA 3.1 tourist guide gave me the exact river rafting timings in Rishikesh and recommended scenic temple detours.', rating: 5 }
            ].map((t, i) => (
              <div
                key={i}
                className="p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-3"
              >
                <div className="flex text-amber-400 text-xs">
                  {[...Array(t.rating)].map((_, s) => (
                    <Star key={s} size={14} fill="currentColor" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  "{t.comment}"
                </p>
                <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
                  <span className="font-bold text-xs text-gray-900 dark:text-white block">{t.name}</span>
                  <span className="text-[10px] text-gray-400">{t.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FAQ ACCORDION */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold">Frequently Asked Questions</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Everything you need to know about Smart Route Planning and the Tourist Guide platform.
            </p>
          </div>
          <Accordion items={faqItems} />
        </div>
      </section>

      {/* 9. READY TO TRAVEL CTA BANNER */}
      <section className="py-20 bg-gradient-to-r from-primary-700 via-primary-600 to-accent-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Ready to Plan Your Next Indian Adventure?
          </h2>
          <p className="text-base sm:text-lg text-primary-100 max-w-2xl mx-auto">
            Join thousands of travelers exploring India with intelligent route mapping, instant hotel reservations, and 24/7 travel support.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link to="/travel-planner">
              <Button size="lg" className="group w-full sm:w-auto !bg-[#ed6a20] !text-white hover:!bg-[#f49a18] font-extrabold shadow-xl border-2 border-[#ffb06f] px-6 sm:px-7">
                <span className="mr-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#ed6a20] group-hover:bg-[#fffdf7] transition-colors">
                  <Navigation size={15} />
                </span>
                <span className="flex flex-col items-start leading-tight">
                  <span className="text-white">Start Route Planning</span>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-[#fff1df]">Live route planner</span>
                </span>
                <ArrowRight size={18} className="ml-3 text-white transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="w-full sm:w-auto !border-2 !border-[#fffdf7] !text-[#fffdf7] hover:!bg-[#fffdf7] hover:!text-[#145a31] font-bold shadow-lg">
                Learn More in About
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 10. PRODUCT WALKTHROUGH */}
      <section className="py-20 bg-[#fffdf7] dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="relative overflow-hidden rounded-[2rem] bg-[#0a3d26] shadow-2xl border border-primary-200/70 dark:border-primary-800/70 aspect-video p-2 sm:p-3">
              <div className="absolute left-5 top-5 z-10 rounded-full bg-[#fffdf7]/90 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-700 shadow-sm backdrop-blur-sm">
                Tourist Guide in motion
              </div>
              <video
                className="h-full w-full rounded-[1.35rem] object-cover"
                src="/WhatsApp%20Video%202026-09-05%20at%2010.56.01%20AM.mp4"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                aria-label="Tourist Guide application walkthrough"
              />
            </div>

            <div className="space-y-5">
              <span className="text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400">
                See the journey before you take it
              </span>
              <h2 className="display-type text-3xl sm:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                One clear route from curiosity to check-in.
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                Tourist Guide brings the whole trip into one calm workspace. Plan a real road route, review genuine stops along the corridor, open each journey leg in Google Maps, and reserve a verified hotel when it is time to stay.
              </p>
              <div className="grid sm:grid-cols-2 gap-3 pt-2">
                {[
                  ['01', 'Plan the road', 'Use live locations and real road directions.'],
                  ['02', 'Choose your stops', 'Discover hotels, food, fuel, and landmarks.'],
                  ['03', 'Open each leg', 'Continue from stop to stop with Maps links.'],
                  ['04', 'Book a stay', 'Reserve hotels directly along the corridor.']
                ].map(([number, title, description]) => (
                  <div key={number} className="rounded-2xl border border-primary-100 dark:border-primary-900/60 bg-primary-50/60 dark:bg-primary-950/30 p-4">
                    <span className="text-xs font-extrabold text-accent-600">{number}</span>
                    <h3 className="mt-1 font-bold text-sm text-gray-900 dark:text-white">{title}</h3>
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
                  </div>
                ))}
              </div>
              <Link to="/travel-planner" className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-bold text-white hover:bg-primary-700 transition-colors">
                Explore Smart Route <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
