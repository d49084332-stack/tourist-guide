import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, Sparkles, Compass, RefreshCw, Layers, Waves } from 'lucide-react';
import { Button } from '../components/Common';
import DestinationCard from '../components/DestinationCard';
import { LoadingSpinner, SkeletonCard, EmptyState } from '../components/Loading';
import { destinationAPI } from '../services/api';
import toast from 'react-hot-toast';

const POPULAR_CHIPS = [
  'All',
  'Hampi',
  'Munnar',
  'Leh-Ladakh',
  'Darjeeling',
  'Coorg',
  'Jaisalmer',
  'Amritsar',
  'Kodaikanal',
  'Goa',
  'Rishikesh'
];

const INDIAN_REGIONS = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

export default function Explore() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiDiscovering, setAiDiscovering] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    state: '',
    budget: ''
  });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchDestinations();
  }, [filters, page]);

  const fetchDestinations = async () => {
    setLoading(true);
    try {
      if (filters.category === 'Beach') {
        const response = await destinationAPI.getLiveBeaches({ state: filters.state });
        setDestinations(response.data.destinations || []);
        setTotal(response.data.count || 0);
        return;
      }

      const response = await destinationAPI.getAll({
        ...filters,
        page,
        limit: 12
      });
      setDestinations(response.data.destinations || []);
      setTotal(response.data.total || 0);
    } catch (error) {
      toast.error('Failed to load destinations');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setFilters({ ...filters, search: e.target.value });
    setPage(1);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters({ ...filters, [filterName]: value });
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ search: '', category: '', state: '', budget: '' });
    setPage(1);
  };

  const handleChipClick = (chip) => {
    if (chip === 'All') {
      setFilters({ ...filters, search: '' });
    } else {
      setFilters({ ...filters, search: chip });
    }
    setPage(1);
  };

  // Trigger real-time AI live discovery for any searched region or city
  const handleAiLiveDiscovery = async () => {
    const query = filters.search.trim() || 'Top Tourist Destinations India';
    setAiDiscovering(true);
    try {
      toast.loading(`🤖 AI & Real Maps analyzing destinations for "${query}"...`, { id: 'ai-explore' });
      const res = await destinationAPI.aiDiscover({
        q: query,
        category: filters.category
      });

      if (res.data?.destinations?.length > 0) {
        setDestinations(res.data.destinations);
        setTotal(res.data.destinations.length);
        toast.success(`Discovered ${res.data.destinations.length} real-world destinations!`, { id: 'ai-explore' });
      } else {
        toast.error('No destinations found for this query.', { id: 'ai-explore' });
      }
    } catch (err) {
      console.error('AI explore error:', err);
      toast.error('AI Discovery service temporarily busy.', { id: 'ai-explore' });
    } finally {
      setAiDiscovering(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 px-3 py-1 rounded-full border border-primary-200 dark:border-primary-800 inline-flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-400" /> AI-Powered Live Destination Explorer
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight gradient-text">
            Explore Destinations Across India
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Search or explore any city, hill station, coastal beach, or heritage site. Our AI and live mapping service detects real destinations with authentic coordinates and travel highlights.
          </p>

          {/* Quick Search Chips */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
            <span className="text-[11px] text-gray-400 font-semibold">Popular:</span>
            {POPULAR_CHIPS.map((chip) => {
              const active = (chip === 'All' && !filters.search) || filters.search === chip;
              return (
                <button
                  key={chip}
                  onClick={() => handleChipClick(chip)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:border-primary-500'
                  }`}
                >
                  {chip}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-800 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search any destination, city, or region (e.g. Hampi, Munnar, Coorg, Leh, Goa)..."
                value={filters.search}
                onChange={handleSearch}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAiLiveDiscovery(); }}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-xs sm:text-sm font-medium focus:border-primary-500 focus:bg-white outline-none"
              />
            </div>

            {/* AI Live Discover Button */}
            <Button
              onClick={handleAiLiveDiscovery}
              disabled={aiDiscovering}
              size="md"
              className="px-5 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md bg-gradient-to-r from-primary-600 to-accent-500 text-white whitespace-nowrap"
            >
              {aiDiscovering ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles size={16} className="text-amber-300" />
                  <span>Discover with AI</span>
                </>
              )}
            </Button>
            <Button
              onClick={() => handleFilterChange('category', 'Beach')}
              disabled={aiDiscovering}
              size="md"
              variant="outline"
              className="px-5 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <Waves size={16} />
              <span>Find Live Beaches</span>
            </Button>
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-medium"
            >
              <option value="">All Categories</option>
              <option value="Beach">Beach</option>
              <option value="Hill Station">Hill Station</option>
              <option value="Historical">Historical</option>
              <option value="Heritage">Heritage</option>
              <option value="Religious">Religious</option>
              <option value="Adventure">Adventure</option>
              <option value="Nature">Nature</option>
            </select>

            <select
              value={filters.state}
              onChange={(e) => handleFilterChange('state', e.target.value)}
              className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-medium"
            >
              <option value="">All States</option>
              {INDIAN_REGIONS.map((region) => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>

            <select
              value={filters.budget}
              onChange={(e) => handleFilterChange('budget', e.target.value)}
              className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-medium"
            >
              <option value="">All Budgets</option>
              <option value="Budget">Budget</option>
              <option value="Mid-range">Mid-range</option>
              <option value="Premium">Premium</option>
              <option value="Luxury">Luxury</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="text-xs font-semibold"
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Results Count & Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Showing {destinations.length} of {total} real-world destinations
            </p>
            <span className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live GPS Verified
            </span>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : destinations.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {destinations.map((dest, idx) => (
                  <motion.div
                    key={dest._id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <DestinationCard destination={dest} onFavoriteChange={fetchDestinations} />
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {total > 12 && (
                <div className="flex justify-center gap-3 pt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center text-xs font-bold text-gray-600 dark:text-gray-300 px-3">
                    Page {page} of {Math.ceil(total / 12)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= Math.ceil(total / 12)}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 p-8 space-y-3">
              <div className="w-14 h-14 rounded-full bg-primary-50 dark:bg-primary-950 text-primary-500 flex items-center justify-center mx-auto">
                <Compass size={28} />
              </div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                No destinations found for "{filters.search}"
              </h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Click "Discover with AI" above to let our AI tourist guide detect and add real destinations in this region!
              </p>
              <Button onClick={handleAiLiveDiscovery} size="sm" className="font-bold text-xs shadow-md">
                <Sparkles size={14} className="mr-1" /> Discover "{filters.search || 'India'}" with AI
              </Button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
