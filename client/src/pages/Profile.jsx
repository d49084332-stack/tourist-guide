import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, MapPin, Calendar, Heart, Luggage, Star, Settings, Save, Check } from 'lucide-react';
import { userAPI, bookingAPI, favoriteAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/Common';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser } = useAuthStore();

  const [name, setName] = useState(user?.name || '');
  const [interests, setInterests] = useState(user?.preferences?.interests || ['Beach', 'Historical']);
  const [budget, setBudget] = useState(user?.preferences?.budget || 'Medium');
  const [travelStyle, setTravelStyle] = useState(user?.preferences?.travelStyle || 'Family');
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ bookingsCount: 0, favoritesCount: 0 });

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const [bookRes, favRes] = await Promise.allSettled([
          bookingAPI.getMyBookings(),
          favoriteAPI.getAll()
        ]);

        const bookingsCount = bookRes.status === 'fulfilled' ? bookRes.value?.data?.count || 0 : 0;
        const favoritesCount = favRes.status === 'fulfilled' ? favRes.value?.data?.count || 0 : 0;

        setStats({ bookingsCount, favoritesCount });
      } catch (e) {
        console.error('Stats error:', e);
      }
    };

    fetchUserStats();
  }, []);

  const categories = ['Beach', 'Hill Station', 'Historical', 'Religious', 'Adventure', 'Nature', 'Heritage'];

  const toggleInterest = (cat) => {
    setInterests((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await userAPI.updateProfile({
        name,
        preferences: {
          interests,
          budget,
          travelStyle
        }
      });

      if (res.data.success) {
        toast.success('Profile and preferences updated successfully!');
        if (updateUser) updateUser(res.data.user);
      }
    } catch (err) {
      console.error('Update profile error:', err);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen py-10 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Profile Card Header */}
        <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-primary-600 to-accent-500 text-white flex items-center justify-center text-3xl font-extrabold shadow-lg flex-shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
                  {user?.name || 'Registered Traveler'}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center sm:justify-start gap-1.5 mt-0.5">
                  <Mail size={14} /> {user?.email}
                </p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 font-bold border border-primary-200 dark:border-primary-800 self-center sm:self-start">
                {user?.role === 'admin' ? 'System Administrator' : 'Verified Explorer'}
              </span>
            </div>

            {/* Travel Stats Chips */}
            <div className="flex flex-wrap gap-4 pt-3 justify-center sm:justify-start">
              <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-800 text-center min-w-[100px]">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Trips Booked</span>
                <span className="text-lg font-extrabold text-primary-600 dark:text-primary-400">
                  {stats.bookingsCount}
                </span>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-800 text-center min-w-[100px]">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Wishlisted</span>
                <span className="text-lg font-extrabold text-rose-500">
                  {stats.favoritesCount}
                </span>
              </div>
              <Link to="/about#completed-trips" className="p-3 bg-primary-50 dark:bg-primary-950/40 hover:bg-primary-100 rounded-xl border border-primary-100 dark:border-primary-800 text-center min-w-[120px] transition-colors">
                <span className="text-[10px] text-primary-500 font-bold uppercase block">Completed Trips</span>
                <span className="text-xs font-bold text-primary-700 dark:text-primary-300">
                  View in About ➔
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Profile Details & Preferences Form */}
        <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-6">
          <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Settings size={20} className="text-primary-500" /> Account Settings & Travel Preferences
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Your preferences directly train the AI recommendation engine and Smart Tourist Guide.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Full Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full text-xs p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Account Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full text-xs p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/40 text-gray-400 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Travel Interests Selection */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Favorite Travel Categories
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const isSelected = interests.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleInterest(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-primary-600 text-white shadow'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {isSelected && <Check size={12} />}
                      <span>{cat}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Budget & Party Style */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Default Budget
                </label>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="Low">Low (Budget Backpacker)</option>
                  <option value="Medium">Medium (Mid-range Stays)</option>
                  <option value="High">High (Premium Hotels)</option>
                  <option value="Luxury">Luxury (5-Star Palace Resorts)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Travel Companion Style
                </label>
                <select
                  value={travelStyle}
                  onChange={(e) => setTravelStyle(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="Solo">Solo Traveler</option>
                  <option value="Couple">Couple / Romantic</option>
                  <option value="Family">Family with Kids</option>
                  <option value="Friends">Group of Friends</option>
                  <option value="Adventure">Adventure Enthusiast</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                type="submit"
                disabled={saving}
                size="md"
                className="text-xs font-bold py-2.5 px-6 flex items-center gap-2 shadow-md"
              >
                <Save size={16} />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </Button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
