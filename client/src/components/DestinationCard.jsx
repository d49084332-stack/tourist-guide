import { useState } from 'react';
import { Heart, MapPin, Zap, ExternalLink, CalendarDays, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Rating, Badge } from './Common';
import { favoriteAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export const DestinationCard = ({ destination, onFavoriteChange }) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();

  const coordinates = destination.location?.coordinates;
  const hasCoordinates = Array.isArray(coordinates) && coordinates.length >= 2;
  const googleMapsUrl = hasCoordinates
    ? `https://www.google.com/maps/search/?api=1&query=${coordinates[1]},${coordinates[0]}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${destination.name}, ${destination.city || ''}, ${destination.state || ''}`)}`;

  const handleFavorite = async () => {
    if (!user) {
      toast.error('Please login to add favorites');
      return;
    }

    setIsLoading(true);
    try {
      if (isFavorited) {
        await favoriteAPI.remove(destination._id);
        setIsFavorited(false);
        toast.success('Removed from favorites');
      } else {
        await favoriteAPI.add(destination._id);
        setIsFavorited(true);
        toast.success('Added to favorites');
      }
      onFavoriteChange?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating favorite');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="card overflow-hidden"
    >
      {/* Verified location details instead of static imagery */}
      <div className="relative min-h-48 bg-[#0a3d26] p-5 text-white">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(135deg, transparent 0 45%, rgba(237,106,32,.6) 45% 46%, transparent 46% 100%)' }} />
        <div className="relative flex h-full min-h-36 flex-col justify-between gap-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#ffb06f]">
                <MapPin size={12} /> Live location details
              </span>
              <p className="mt-2 text-sm font-semibold text-white/80">
                {destination.location?.address || `${destination.city || 'India'}, ${destination.state || ''}`}
              </p>
            </div>
            {destination.featured && <Badge variant="success">Featured</Badge>}
          </div>
          <div className="flex flex-wrap gap-2 text-[11px] text-white/75">
            {destination.bestTimeToVisit && <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1"><CalendarDays size={12} /> {destination.bestTimeToVisit}</span>}
            {destination.duration && <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1"><Clock3 size={12} /> {destination.duration}</span>}
          </div>
        </div>
        <button
          onClick={handleFavorite}
          disabled={isLoading}
          className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
        >
          <Heart
            size={20}
            className={isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-400'}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
              {destination.name}
            </h3>
          </div>
          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-sm mb-2">
            <MapPin size={14} />
            {destination.city}, {destination.state}
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
          {destination.shortDescription || destination.description?.substring(0, 100)}
        </p>

        {/* Category and Rating */}
        <div className="flex items-center gap-2">
          <Badge variant="primary" className="text-xs">
            {destination.category}
          </Badge>
          <Rating value={Math.round(destination.rating || 0)} count={destination.reviewCount} readOnly />
        </div>

        {/* Activities */}
        {destination.activities?.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {destination.activities?.slice(0, 2).map((activity, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {activity}
              </Badge>
            ))}
          </div>
        )}

        {/* Budget */}
        {destination.estimatedBudget && (
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
            <Zap size={14} />
            {destination.estimatedBudget}
          </div>
        )}

        {destination.nearbyPlaces?.length > 0 && (
          <div className="text-xs text-gray-600 dark:text-gray-400">
            <span className="font-semibold text-gray-800 dark:text-gray-200">Nearby: </span>
            {destination.nearbyPlaces.slice(0, 2).join(' · ')}
          </div>
        )}

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noreferrer"
          className="w-full mt-1 px-4 py-2.5 rounded-lg bg-[#2d9b4e] text-white hover:bg-[#258441] inline-flex items-center justify-center gap-2 text-sm font-bold transition-colors"
        >
          <MapPin size={15} /> Open in Google Maps <ExternalLink size={13} />
        </a>

        {destination.liveSource && (
          <p className="text-[10px] text-primary-600 dark:text-primary-400 font-semibold text-center">
            Live map source: {destination.liveSource}
          </p>
        )}

        {/* View Details Button */}
        <Link to={`/destinations/${destination._id}`} className="block">
          <Button variant="outline" size="sm" className="w-full mt-4">
            View Details
          </Button>
        </Link>
      </div>
    </motion.div>
  );
};

export default DestinationCard;
