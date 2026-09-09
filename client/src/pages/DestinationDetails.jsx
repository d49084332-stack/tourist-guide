import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin,
  Star,
  Calendar,
  DollarSign,
  Heart,
  Navigation,
  Share2,
  CheckCircle2,
  Info,
  Clock,
  ArrowLeft,
  MessageSquare
} from 'lucide-react';
import { destinationAPI, favoriteAPI, reviewAPI } from '../services/api';
import { Button, Badge } from '../components/Common';
import { LoadingSpinner } from '../components/Loading';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function DestinationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await destinationAPI.getById(id);
        if (res.data.success) {
          setDestination(res.data.destination);
        }

        if (user) {
          const favRes = await favoriteAPI.check(id);
          setIsFavorite(favRes.data.isFavorite);
        }

        const revRes = await reviewAPI.getByDestination(id);
        if (revRes.data.success) {
          setReviews(revRes.data.reviews || []);
        }
      } catch (err) {
        console.error('Fetch destination error:', err);
        toast.error('Failed to load destination details');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id, user]);

  const toggleFavorite = async () => {
    if (!user) {
      toast.error('Please login to save favorites');
      navigate('/login');
      return;
    }

    try {
      if (isFavorite) {
        await favoriteAPI.remove(id);
        setIsFavorite(false);
        toast.success('Removed from favorites');
      } else {
        await favoriteAPI.add(id);
        setIsFavorite(true);
        toast.success('Saved to favorites!');
      }
    } catch (err) {
      toast.error('Failed to update favorites');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to write a review');
      navigate('/login');
      return;
    }

    if (!comment.trim() || comment.trim().length < 10) {
      toast.error('Review comment must be at least 10 characters long');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await reviewAPI.create({
        destinationId: id,
        rating,
        comment: comment.trim()
      });

      if (res.data.success) {
        toast.success('Review submitted successfully!');
        setComment('');
        const revRes = await reviewAPI.getByDestination(id);
        if (revRes.data.success) {
          setReviews(revRes.data.reviews || []);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner />
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-center px-4">
        <h2 className="text-2xl font-bold mb-2">Destination Not Found</h2>
        <p className="text-gray-500 mb-6">The requested tourist destination does not exist.</p>
        <Link to="/explore">
          <Button>Back to Explore</Button>
        </Link>
      </div>
    );
  }

  const images = destination.images?.length > 0
    ? destination.images.map(img => img.url)
    : ['https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1000'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Destinations
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFavorite}
              className={`p-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all ${
                isFavorite
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 border-rose-200 dark:border-rose-900 shadow-sm'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100'
              }`}
            >
              <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
              <span>{isFavorite ? 'Saved' : 'Save'}</span>
            </button>
            <Link to={`/travel-planner?destination=${encodeURIComponent(destination.name)}`}>
              <Button size="sm" className="flex items-center gap-1.5 shadow-md">
                <Navigation size={14} /> Plan Smart Route
              </Button>
            </Link>
          </div>
        </div>

        {/* Gallery & Header Hero */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-xl border border-gray-100 dark:border-gray-800">
          <div className="relative h-[380px] sm:h-[480px] overflow-hidden">
            <img
              src={images[activeImageIndex]}
              alt={destination.name}
              className="w-full h-full object-cover transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-between p-6 sm:p-10 text-white">
              <div className="flex justify-between items-start">
                <Badge variant="primary" className="text-xs uppercase tracking-wider font-bold">
                  {destination.category}
                </Badge>
              </div>

              <div>
                <div className="flex items-center gap-2 text-amber-400 text-sm font-bold mb-1">
                  <Star size={16} fill="currentColor" /> {destination.rating || 4.8}
                  <span className="text-white/80 font-normal">({destination.reviewCount || 310} traveler reviews)</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                  {destination.name}
                </h1>
                <p className="text-sm sm:text-base text-gray-200 flex items-center gap-1.5 mt-1">
                  <MapPin size={16} className="text-rose-400" />
                  {destination.city ? `${destination.city}, ` : ''}{destination.state}, {destination.country}
                </p>
              </div>
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 p-4 bg-gray-50 dark:bg-gray-800/60 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImageIndex(i)}
                  className={`w-20 h-14 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    activeImageIndex === i ? 'border-primary-500 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Description & Activities */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                About {destination.name}
              </h2>
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                {destination.description}
              </p>
              {destination.travelTips && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                  <Info size={18} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Traveler Tip:</strong> {destination.travelTips}
                  </div>
                </div>
              )}
            </div>

            {/* Activities & Experiences */}
            {destination.activities && destination.activities.length > 0 && (
              <div className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Top Activities & Highlights
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {destination.activities.map((act, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200"
                    >
                      <CheckCircle2 size={16} className="text-primary-500 flex-shrink-0" />
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nearby Attractions */}
            {destination.nearbyPlaces && destination.nearbyPlaces.length > 0 && (
              <div className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Nearby Notable Places
                </h3>
                <div className="flex flex-wrap gap-2">
                  {destination.nearbyPlaces.map((place, idx) => (
                    <span
                      key={idx}
                      className="px-3.5 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300 text-xs font-semibold border border-primary-100 dark:border-primary-800"
                    >
                      📍 {place}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <div className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <MessageSquare size={20} className="text-primary-500" /> Traveler Reviews ({reviews.length})
                </h3>
                <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                  ⭐ {destination.rating || 4.8} / 5.0
                </span>
              </div>

              {/* Review Submission Form */}
              <form onSubmit={handleReviewSubmit} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500">
                  Write Your Review
                </h4>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className={`p-1 ${s <= rating ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
                    >
                      <Star size={20} fill={s <= rating ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                  <span className="text-xs font-semibold text-gray-500 ml-2">{rating} Stars</span>
                </div>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience at this destination, best photo spots, local food..."
                  className="w-full text-xs p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none"
                  required
                />
                <Button type="submit" disabled={submittingReview} size="sm" className="text-xs font-bold">
                  {submittingReview ? 'Submitting...' : 'Post Review'}
                </Button>
              </form>

              {/* Reviews List */}
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div key={rev._id} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900 dark:text-white">
                        {rev.userId?.name || 'Verified Traveler'}
                      </span>
                      <div className="flex text-amber-400 text-xs">
                        {[1, 2, 3, 4, 5].map((st) => (
                          <Star key={st} size={12} fill={st <= rev.rating ? 'currentColor' : 'none'} />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">{rev.comment}</p>
                    <span className="text-[10px] text-gray-400 block">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Quick Travel Facts */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-4 sticky top-24">
              <h3 className="font-bold text-base text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">
                Trip Quick Facts
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 flex items-center gap-1.5">
                    <Calendar size={14} className="text-primary-500" /> Best Time to Visit:
                  </span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {destination.bestTimeToVisit || 'October to March'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-400 flex items-center gap-1.5">
                    <Clock size={14} className="text-amber-500" /> Recommended Duration:
                  </span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {destination.duration || '2-3 days'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-400 flex items-center gap-1.5">
                    <DollarSign size={14} className="text-emerald-500" /> Budget Category:
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {destination.estimatedBudget || 'Mid-range'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-400 flex items-center gap-1.5">
                    <MapPin size={14} className="text-rose-500" /> Location:
                  </span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {destination.state}, India
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
                <Link to={`/travel-planner?destination=${encodeURIComponent(destination.name)}`} className="block">
                  <Button size="lg" className="w-full text-xs font-bold shadow-lg flex items-center justify-center gap-2">
                    <Navigation size={16} /> Plan Route to {destination.name}
                  </Button>
                </Link>
                <Link to="/ai-assistant" className="block">
                  <Button variant="outline" size="md" className="w-full text-xs font-semibold">
                    Ask AI Assistant About This Trip
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
