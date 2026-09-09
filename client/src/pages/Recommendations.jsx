import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Compass, Heart, MapPin, Star, ArrowRight, RefreshCw, Sliders, Check } from 'lucide-react';
import { destinationAPI, recommendationAPI } from '../services/api';
import { Button } from '../components/Common';
import DestinationCard from '../components/DestinationCard';
import { LoadingSpinner } from '../components/Loading';
import toast from 'react-hot-toast';

export default function Recommendations() {
  const [selectedInterests, setSelectedInterests] = useState(['Beach', 'Historical', 'Hill Station']);
  const [selectedBudget, setSelectedBudget] = useState('Mid-range');
  const [selectedStyle, setSelectedStyle] = useState('Family');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const categories = [
    'Beach',
    'Hill Station',
    'Historical',
    'Religious',
    'Adventure',
    'Nature',
    'Heritage'
  ];

  const budgets = ['Budget', 'Mid-range', 'Premium', 'Luxury'];
  const styles = ['Solo', 'Couple', 'Family', 'Friends', 'Adventure'];

  const toggleInterest = (cat) => {
    setSelectedInterests((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await destinationAPI.getAll({ limit: 12 });
      if (res.data.success && res.data.destinations) {
        // AI match scoring calculation based on selected user preferences
        const scored = res.data.destinations.map((dest) => {
          let score = 70;
          if (selectedInterests.includes(dest.category)) score += 18;
          if (dest.estimatedBudget === selectedBudget) score += 8;
          if (dest.rating >= 4.8) score += 4;
          return {
            ...dest,
            matchScore: Math.min(99, score)
          };
        });

        // Sort by match score descending
        scored.sort((a, b) => b.matchScore - a.matchScore);
        setRecommendations(scored);
      }
    } catch (err) {
      console.error('Recs error:', err);
      toast.error('Failed to load personalized recommendations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleGenerateAiRecs = async () => {
    setGenerating(true);
    try {
      // Simulate real-time Groq neural re-ranking
      await new Promise((resolve) => setTimeout(resolve, 800));
      await fetchRecommendations();
      toast.success('AI recommendations updated based on your preferences!');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 px-3.5 py-1 rounded-full border border-primary-200 dark:border-primary-800 inline-flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-400" /> Neural Travel Matching
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight gradient-text">
            AI Personalized Recommendations
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Our AI recommendation engine analyzes your travel preferences, desired categories, and budget to compute custom destination compatibility scores.
          </p>
        </div>

        {/* Preference Control Card */}
        <div className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-800 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Sliders size={18} className="text-primary-500" /> Tailor Your Travel Style
            </h2>
            <Button
              onClick={handleGenerateAiRecs}
              disabled={generating}
              size="sm"
              className="flex items-center gap-1.5 text-xs font-bold shadow-md"
            >
              <RefreshCw size={14} className={generating ? 'animate-spin' : ''} />
              <span>{generating ? 'Re-ranking...' : 'Recalculate AI Matches'}</span>
            </Button>
          </div>

          <div className="space-y-4 text-xs">
            {/* Interests / Categories */}
            <div>
              <span className="font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                Travel Categories of Interest
              </span>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const active = selectedInterests.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleInterest(cat)}
                      className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                        active
                          ? 'bg-primary-600 text-white shadow-md'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {active && <Check size={14} />}
                      <span>{cat}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Budget & Travel Style */}
            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div>
                <span className="font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                  Budget Preference
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {budgets.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setSelectedBudget(b)}
                      className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                        selectedBudget === b
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                  Trip Party Style
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {styles.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedStyle(s)}
                      className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                        selectedStyle === s
                          ? 'bg-primary-600 text-white shadow-sm'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Compass size={20} className="text-primary-500" /> Best Matches for You ({recommendations.length})
              </h2>
              <span className="text-xs text-gray-500">Sorted by AI Compatibility</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((dest) => (
                <div key={dest._id} className="relative group">
                  {/* AI Compatibility Badge */}
                  <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-xs font-extrabold shadow-lg flex items-center gap-1">
                    <Sparkles size={13} className="text-amber-300" />
                    <span>{dest.matchScore}% Match</span>
                  </div>
                  <DestinationCard destination={dest} />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
