import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Trash2, ArrowRight, Compass, MapPin } from 'lucide-react';
import { favoriteAPI } from '../services/api';
import { Button } from '../components/Common';
import DestinationCard from '../components/DestinationCard';
import { LoadingSpinner } from '../components/Loading';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await favoriteAPI.getAll();
      if (res.data.success) {
        setFavorites(res.data.favorites || []);
      }
    } catch (err) {
      console.error('Fetch favs error:', err);
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemove = async (destId, e) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await favoriteAPI.remove(destId);
      setFavorites((prev) => prev.filter((f) => f.destinationId?._id !== destId && f._id !== destId));
      toast.success('Removed from saved favorites');
    } catch (err) {
      toast.error('Could not remove favorite');
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <Heart size={14} fill="currentColor" /> Saved Wishlist
            </span>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
              My Favorite Destinations
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Easily plan trips to the destinations and landmarks you love.
            </p>
          </div>
          <Link to="/explore">
            <Button size="sm" variant="outline" className="flex items-center gap-1.5 text-xs font-semibold">
              <Compass size={14} /> Explore More
            </Button>
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((fav) => {
              const dest = fav.destinationId || fav;
              if (!dest || !dest._id) return null;

              return (
                <div key={fav._id} className="relative group">
                  <DestinationCard destination={dest} />
                  <button
                    onClick={(e) => handleRemove(dest._id, e)}
                    className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/90 dark:bg-gray-900/90 text-rose-600 hover:bg-rose-500 hover:text-white shadow-md transition-all"
                    title="Remove from favorites"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24 bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 max-w-lg mx-auto p-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mx-auto">
              <Heart size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              No Favorites Saved Yet
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Explore destinations across India and tap the heart icon to save places for your future travel plans.
            </p>
            <Link to="/explore" className="inline-block">
              <Button size="md" className="text-xs font-bold shadow-md">
                Browse Destinations
              </Button>
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
