import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Navigation, Compass, Clock, Milestone, Hotel,
  Search, Sparkles, ArrowRight, ExternalLink, Star,
  LocateFixed, RefreshCw, Filter, Phone, X, ChevronDown, Map
} from 'lucide-react';
import InteractiveMap from '../components/InteractiveMap';
import HotelBookingModal from '../components/HotelBookingModal';
import PaymentModal from '../components/PaymentModal';
import BookingSuccessModal from '../components/BookingSuccessModal';
import { routeAPI } from '../services/api';
import { Button } from '../components/Common';
import toast from 'react-hot-toast';

const ALL_CATEGORIES = [
  'All', 'Hotel', 'Temple', 'Restaurant', 'Cafe', 'Tourist Attraction',
  'Fuel', 'Hospital', 'Viewpoint', 'Historical Place', 'Fort', 'Waterfall',
  'Beach', 'Shopping', 'Parking', 'Nature & Wildlife', 'Park'
];

const CATEGORY_ICONS = {
  'All': '🗺️', 'Hotel': '🏨', 'Temple': '🛕', 'Restaurant': '🍴', 'Cafe': '☕',
  'Tourist Attraction': '📍', 'Fuel': '⛽', 'Hospital': '🏥',
  'Viewpoint': '🌄', 'Historical Place': '🏛️', 'Fort': '🏰',
  'Waterfall': '🌊', 'Beach': '🏖️', 'Shopping': '🛍️',
  'Parking': '🅿️', 'Nature & Wildlife': '🌳', 'Park': '🌿', 'Church': '⛪'
};

const RADIUS_OPTIONS = [
  { label: '1 km', value: 1 },
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: '20 km', value: 20 }
];

const POPULAR_PRESETS = [
  { label: 'Delhi → Agra', start: 'Delhi', dest: 'Agra' },
  { label: 'Mumbai → Goa', start: 'Mumbai', dest: 'Goa' },
  { label: 'Vijayawada → Hyderabad', start: 'Vijayawada', dest: 'Hyderabad' },
  { label: 'Bengaluru → Ooty', start: 'Bengaluru', dest: 'Ooty' },
  { label: 'Jaipur → Udaipur', start: 'Jaipur', dest: 'Udaipur' },
  { label: 'Chennai → Pondicherry', start: 'Chennai', dest: 'Pondicherry' },
  { label: 'Hyderabad → Hampi', start: 'Hyderabad', dest: 'Hampi' },
  { label: 'Delhi → Manali', start: 'Delhi', dest: 'Manali' },
  { label: 'Kolkata → Darjeeling', start: 'Kolkata', dest: 'Darjeeling' },
  { label: 'Pune → Mahabaleshwar', start: 'Pune', dest: 'Mahabaleshwar' }
];

const PAGE_SIZE = 12;

const getRoutePosition = (coordinates, waypoints = []) => {
  if (!coordinates || !waypoints.length) return Number.MAX_SAFE_INTEGER;
  let closestIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;

  waypoints.forEach(([lat, lon], index) => {
    const distance = (coordinates[0] - lat) ** 2 + (coordinates[1] - lon) ** 2;
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  return closestIndex;
};

export default function SmartRoutePlanner() {
  const [startLocation, setStartLocation] = useState('Delhi');
  const [destination, setDestination] = useState('Agra');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRadius, setSelectedRadius] = useState(10);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [routeData, setRouteData] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [detailPlace, setDetailPlace] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);

  // Filter state for places panel
  const [displayedPlaces, setDisplayedPlaces] = useState([]);

  // Booking flow modals
  const [hotelForBooking, setHotelForBooking] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [pendingBookingPayload, setPendingBookingPayload] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const placesRef = useRef(null);
  const routeRequestRef = useRef(0);

  // Fetch route from the backend (real geocoding + OSRM/Google routing + live POI discovery)
  const fetchRoute = useCallback(async (start, dest, category = 'All', radius = 10) => {
    if (!start?.trim() || !dest?.trim()) {
      toast.error('Please enter both a starting location and destination.');
      return;
    }
    if (start.trim().toLowerCase() === dest.trim().toLowerCase()) {
      toast.error('Starting location and destination cannot be the same.');
      return;
    }

    const requestId = ++routeRequestRef.current;
    setLoading(true);
    setRouteData(null);
    setDisplayedPlaces([]);
    setSelectedPlace(null);
    setPage(1);

    try {
      const params = {
        start: start.trim(),
        destination: dest.trim(),
        radius
      };
      if (category && category !== 'All') {
        params.category = category;
      }

      const response = await routeAPI.plan(params);

      if (requestId !== routeRequestRef.current) return;

      if (response.data.success) {
        const route = response.data.route;
        setRouteData(route);
        const allPlaces = route.places || [];
        setDisplayedPlaces(allPlaces);

        if (allPlaces.length > 0) {
          setSelectedPlace(allPlaces[0]);
        }

        toast.success(
          `Route: ${route.distanceKm} km | ${route.estimatedDuration} | ${route.totalPlacesInCorridor || allPlaces.length} places discovered`,
          { duration: 4500 }
        );
      } else {
        toast.error(response.data.message || 'Could not plan route. Please verify location names.');
      }
    } catch (error) {
      if (requestId !== routeRequestRef.current) return;
      const msg = error.response?.data?.message || error.message || 'Route planning failed.';
      toast.error(msg);
    } finally {
      if (requestId === routeRequestRef.current) setLoading(false);
    }
  }, []);

  // Load default route on mount
  useEffect(() => {
    fetchRoute('Delhi', 'Agra', 'All', 10);
  }, []);

  // Filter displayed places when category changes without refetching
  useEffect(() => {
    if (!routeData?.places) return;
    setPage(1);
    if (selectedCategory === 'All') {
      setDisplayedPlaces(routeData.places);
    } else {
      setDisplayedPlaces(routeData.places.filter(p => p.category === selectedCategory));
    }
  }, [selectedCategory, routeData]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRoute(startLocation, destination, selectedCategory, selectedRadius);
  };

  const handlePresetSelect = (preset) => {
    setStartLocation(preset.start);
    setDestination(preset.dest);
    fetchRoute(preset.start, preset.dest, selectedCategory, selectedRadius);
  };

  // Browser GPS current location
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await routeAPI.reverseGeocode({ lat: latitude, lon: longitude });
          const cityName = res.data?.city || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          setStartLocation(cityName);
          await fetchRoute(cityName, destination, selectedCategory, selectedRadius);
          toast.success(`📍 Current location detected: ${cityName}`);
        } catch {
          const fallback = `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
          setStartLocation(fallback);
          await fetchRoute(fallback, destination, selectedCategory, selectedRadius);
          toast.success(`📍 Current location set.`);
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        const messages = {
          1: 'Location permission denied. Please allow location access in your browser settings.',
          2: 'Could not determine your location. Please try again.',
          3: 'Location request timed out.'
        };
        toast.error(messages[err.code] || 'Geolocation error.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Booking flow handlers
  const handleOpenHotelBooking = (place) => {
    if (!place?.isHotel) {
      toast.error('Booking is available only for verified hotels along this route.');
      return;
    }
    setHotelForBooking(place);
    setIsBookingModalOpen(true);
  };

  const handleProceedToPayment = (payload) => {
    setIsBookingModalOpen(false);
    setPendingBookingPayload(payload);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (booking) => {
    setIsPaymentModalOpen(false);
    setConfirmedBooking(booking);
    setIsSuccessModalOpen(true);
  };

  const handleGetDirections = (place, e) => {
    e?.stopPropagation();
    if (place.googleMapsUrl) {
      window.open(place.googleMapsUrl, '_blank');
    } else if (place.coordinates) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${place.coordinates[0]},${place.coordinates[1]}`, '_blank');
    }
  };

  // Places for current page
  const pagedPlaces = displayedPlaces.slice(0, page * PAGE_SIZE);
  const hasMore = pagedPlaces.length < displayedPlaces.length;

  const categoryCounts = routeData?.categoryCounts || {};
  const journeyStops = routeData
    ? [...(routeData.places || [])]
      .filter(place => place.coordinates?.length >= 2)
      .sort((a, b) => getRoutePosition(a.coordinates, routeData.waypoints) - getRoutePosition(b.coordinates, routeData.waypoints))
    : [];

  const journeyLegs = routeData && journeyStops.length > 0
    ? [
      { from: routeData.startCity, fromCoords: routeData.startCoords, to: journeyStops[0].name, toCoords: journeyStops[0].coordinates },
      ...journeyStops.slice(0, -1).map((stop, index) => ({
        from: stop.name,
        fromCoords: stop.coordinates,
        to: journeyStops[index + 1].name,
        toCoords: journeyStops[index + 1].coordinates
      })),
      { from: journeyStops[journeyStops.length - 1].name, fromCoords: journeyStops[journeyStops.length - 1].coordinates, to: routeData.destCity, toCoords: routeData.destCoords }
    ]
    : routeData
      ? [{ from: routeData.startCity, fromCoords: routeData.startCoords, to: routeData.destCity, toCoords: routeData.destCoords }]
      : [];
  const hotelStops = journeyStops.filter(place => place.isHotel);

  const createGoogleRouteUrl = (fromCoords, toCoords) => (
    `https://www.google.com/maps/dir/?api=1&origin=${fromCoords[0]},${fromCoords[1]}&destination=${toCoords[0]},${toCoords[1]}&travelmode=driving`
  );

  return (
    <div className="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-7">

        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 px-3 py-1 rounded-full border border-primary-200 dark:border-primary-800 inline-flex items-center gap-1.5">
            <Compass size={14} /> AI-Powered Real-Time Route & POI Discovery
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight gradient-text">
            🗺️ Smart Route Planner
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Enter any starting point and destination — our AI discovers real hotels, temples, fuel stations, hospitals, restaurants, and more along the actual highway corridor.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 dark:bg-primary-950/50 border border-primary-200 dark:border-primary-800 px-3 py-1.5 text-[11px] font-bold text-primary-700 dark:text-primary-300">
              <span className="h-2 w-2 rounded-full bg-primary-500 animate-pulse" /> Live road and place data
            </span>
            {routeData && (
              <button
                type="button"
                onClick={() => fetchRoute(startLocation, destination, selectedCategory, selectedRadius)}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-[11px] font-bold text-gray-600 dark:text-gray-300 hover:border-primary-400 hover:text-primary-600 transition-colors"
              >
                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh this route
              </button>
            )}
          </div>
        </div>

        {/* Search Card */}
        <div className="bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-800 space-y-4">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">

            {/* Start Location */}
            <div className="sm:col-span-4 space-y-1">
              <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Starting Location
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={startLocation}
                    onChange={(e) => setStartLocation(e.target.value)}
                    placeholder="e.g. Delhi, Vijayawada…"
                    required
                    className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-medium focus:border-primary-500 focus:bg-white dark:focus:bg-gray-900 outline-none transition-colors"
                  />
                  <MapPin size={15} className="absolute left-3 top-3 text-emerald-500" />
                </div>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={locating}
                  title="Use my current GPS location"
                  className="flex-shrink-0 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-primary-950/40 text-primary-600 dark:text-primary-400 transition-colors"
                >
                  {locating
                    ? <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    : <LocateFixed size={16} />
                  }
                </button>
              </div>
            </div>

            {/* Destination */}
            <div className="sm:col-span-4 space-y-1">
              <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Destination
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Agra, Goa, Hyderabad…"
                  required
                  className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-medium focus:border-primary-500 focus:bg-white dark:focus:bg-gray-900 outline-none transition-colors"
                />
                <Navigation size={15} className="absolute left-3 top-3 text-rose-500" />
              </div>
            </div>

            {/* Radius & Submit */}
            <div className="sm:col-span-4 space-y-1">
              <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Search Radius
              </label>
              <div className="flex gap-2">
                <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 flex-1">
                  {RADIUS_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSelectedRadius(opt.value)}
                      className={`flex-1 py-2.5 text-xs font-bold transition-colors ${
                        selectedRadius === opt.value
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2.5 font-bold text-sm flex items-center justify-center gap-1.5 shadow-md"
                >
                  {loading
                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <><Search size={15} /> Plan</>
                  }
                </Button>
              </div>
            </div>
          </form>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <span className="text-[11px] text-gray-400 font-semibold flex-shrink-0">Quick routes:</span>
            {POPULAR_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-primary-950/40 hover:text-primary-600 text-gray-700 dark:text-gray-300 transition-colors font-medium text-[11px]"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Route Overview Stats */}
        {routeData && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <MapPin size={20} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Route</span>
                <span className="text-xs font-extrabold text-gray-900 dark:text-white truncate block">
                  {routeData.startCity} → {routeData.destCity}
                </span>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 flex items-center justify-center flex-shrink-0">
                <Milestone size={20} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Distance</span>
                <span className="text-xs font-extrabold text-primary-600 dark:text-primary-400">{routeData.distanceKm} km</span>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center flex-shrink-0">
                <Clock size={20} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Travel Time</span>
                <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400">{routeData.estimatedDuration}</span>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 flex items-center justify-center flex-shrink-0">
                <Compass size={20} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Highway</span>
                <span className="text-xs font-extrabold text-primary-600 dark:text-primary-400 block truncate">{routeData.routeHighway || 'National Highway'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Sequential Google Maps Journey */}
        {routeData && (
          <section className="bg-[#0a3d26] text-white p-5 sm:p-6 rounded-3xl shadow-xl border border-[#1d6b36] space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#ffb06f] flex items-center gap-1.5">
                  <Navigation size={14} /> Your journey, one leg at a time
                </span>
                <h2 className="text-xl font-bold mt-1">Google Maps route links</h2>
                <p className="text-xs text-white/65 mt-1">Open each leg, complete the stop, then continue to the next one.</p>
              </div>
              <span className="text-[11px] rounded-full bg-white/10 px-3 py-1 text-white/70">{journeyLegs.length} legs</span>
            </div>

            <div className="grid gap-2">
              {journeyLegs.map((leg, index) => (
                <a
                  key={`${leg.from}-${leg.to}-${index}`}
                  href={createGoogleRouteUrl(leg.fromCoords, leg.toCoords)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-2xl bg-white/10 border border-white/10 px-3 py-3 hover:bg-white/15 transition-colors"
                >
                  <span className="w-7 h-7 rounded-full bg-[#ed6a20] flex items-center justify-center text-xs font-bold flex-shrink-0">{index + 1}</span>
                  <span className="flex-1 min-w-0 text-sm font-semibold truncate">{leg.from} <span className="text-[#ffb06f] px-1">→</span> {leg.to}</span>
                  <span className="text-[11px] text-[#ffb06f] font-bold flex items-center gap-1 flex-shrink-0"><ExternalLink size={13} /> Open leg</span>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Live Hotels Along Route */}
        {routeData && (
          <section className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400 flex items-center gap-1.5">
                  <Hotel size={14} /> Hotels available to book
                </span>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-1">Stop and stay when you need to</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {hotelStops.some(h => h.isFallback)
                    ? 'Verified live hotels were not found on this corridor. Showing curated suggested stays that are fully bookable.'
                    : 'Only verified hotels near the actual road corridor can be booked here. Other places remain discovery-only.'}
                </p>
              </div>
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{hotelStops.length} stay options</span>
            </div>

            {hotelStops.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hotelStops.map((hotel, index) => (
                  <div key={hotel.id || hotel.name} className="bg-white dark:bg-gray-900 rounded-2xl border border-amber-200 dark:border-amber-900/50 p-4 shadow-sm flex flex-col gap-3">
                    {/* Hotel image */}
                    {hotel.images?.[0]?.url && (
                      <div className="rounded-xl overflow-hidden h-36 w-full">
                        <img
                          src={hotel.images[0].url}
                          alt={hotel.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center flex-shrink-0 text-xl">🏨</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-sm text-gray-900 dark:text-white">{hotel.name}</h3>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <span className="text-[10px] font-bold text-amber-600 whitespace-nowrap">Stop {index + 1}</span>
                            {hotel.isFallback && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800 whitespace-nowrap">
                                ✦ Suggested
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 truncate">{hotel.locationAddress || hotel.distanceFromRouteKm}</p>
                        {hotel.description && (
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{hotel.description}</p>
                        )}
                      </div>
                    </div>
                    {/* Facilities chips */}
                    {hotel.facilities?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {hotel.facilities.slice(0, 4).map((fac, i) => (
                          <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">✓ {fac}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-bold text-amber-500">★ {(hotel.rating || 4).toFixed(1)} <span className="text-gray-400 font-normal">({hotel.reviewCount || '—'} reviews)</span></span>
                      {hotel.pricePerNight && <span className="font-bold text-primary-600 dark:text-primary-400">₹{hotel.pricePerNight.toLocaleString()}/night</span>}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenHotelBooking(hotel)}
                        className="flex-1 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold flex items-center justify-center gap-1.5"
                      >
                        <Hotel size={13} /> Book stay
                      </button>
                      <button
                        onClick={(event) => handleGetDirections(hotel, event)}
                        className="px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5"
                        title="Open hotel in Google Maps"
                      >
                        <Navigation size={13} /> Maps
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-5 text-sm text-gray-500 dark:text-gray-400">
                No hotels were found for this route. Try a larger search radius or search again later.
              </div>
            )}
          </section>
        )}

        {/* AI Route Corridor Insights Banner */}
        {routeData?.corridorInsights && (
          <div className="p-5 bg-gradient-to-r from-primary-500/10 via-primary-400/10 to-accent-500/10 dark:from-primary-950/40 dark:via-primary-900/40 dark:to-orange-950/40 rounded-3xl border border-primary-200/60 dark:border-primary-800/60 shadow-sm space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-400" /> AI Tourist Guide Corridor Analysis
              </span>
              {routeData.corridorInsights.stopovers?.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                  <span className="font-semibold text-gray-400 text-[11px]">Recommended Stops:</span>
                  {routeData.corridorInsights.stopovers.map((s, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-white dark:bg-gray-800 font-bold text-[10px] shadow-sm border border-gray-200 dark:border-gray-700">
                      📍 {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
              {routeData.corridorInsights.summary}
            </p>
            {routeData.corridorInsights.travelTip && (
              <p className="text-[11px] text-amber-700 dark:text-amber-300 flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800/60 font-medium">
                <span>💡</span>
                <span><strong>Highway Tip:</strong> {routeData.corridorInsights.travelTip}</span>
              </p>
            )}
          </div>
        )}

        {/* Interactive Map */}
        <InteractiveMap
          route={routeData}
          places={displayedPlaces}
          selectedPlace={selectedPlace}
          onSelectPlace={setSelectedPlace}
          onBookHotel={handleOpenHotelBooking}
        />

        {/* Loading skeleton for places */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 animate-pulse">
                <div className="h-44 bg-gray-200 dark:bg-gray-800" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Turn-by-Turn Directions */}
        {routeData?.turnByTurnDirections?.length > 0 && (
              <div className="bg-[#0a3d26] text-white p-6 rounded-3xl shadow-xl border border-[#1d6b36] space-y-4">
            <div className="flex flex-wrap items-center gap-2">
                  <Navigation size={18} className="text-[#ffb06f]" />
              <h3 className="font-bold text-base">Your route, step by step</h3>
              <span className="text-[10px] font-normal text-white/60 ml-auto">
                {routeData.provider === 'google' ? 'Google Directions' : 'OSRM Road Engine'}
              </span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {routeData.turnByTurnDirections.map((step) => (
                <div key={step.step} className="flex items-start gap-3 p-3 rounded-xl bg-white/10 border border-white/10 text-xs">
                      <div className="w-6 h-6 rounded-full bg-[#ed6a20] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">{step.step}</div>
                  <div className="flex-1 flex flex-col gap-1">
                    <span className="text-white/90 font-medium">{step.instruction}</span>
                    <span className="text-[11px] text-[#ffb06f] font-bold">{step.road} · {step.distance}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Places Along Route */}
        {routeData && !loading && (
          <div className="space-y-5" ref={placesRef}>
            {/* Section Header + Category Filters + Radius info */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 flex items-center gap-1">
                    <Sparkles size={13} /> Real-World Places Discovered
                  </span>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {displayedPlaces.length} Places Within {selectedRadius} km of Route
                    {routeData.totalPlacesInCorridor && routeData.totalPlacesInCorridor !== displayedPlaces.length && (
                      <span className="text-sm font-normal text-gray-400 ml-2">({routeData.totalPlacesInCorridor} total found)</span>
                    )}
                  </h2>
                  {routeData.geocoderProvider && (
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      ✅ Geocoded via {routeData.geocoderProvider === 'google' ? 'Google Maps' : 'OpenStreetMap'} • Routes via {routeData.provider === 'google' ? 'Google Directions API' : routeData.provider === 'osrm' ? 'OSRM Real Roads' : 'Live Engine'}
                    </p>
                  )}
                </div>
              </div>

              {/* Category Filter Pills with counts */}
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                {ALL_CATEGORIES.filter(cat =>
                  cat === 'All' || (categoryCounts[cat] && categoryCounts[cat] > 0)
                ).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-xl font-bold transition-all flex items-center gap-1 ${
                      selectedCategory === cat
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span>{CATEGORY_ICONS[cat] || '📌'}</span>
                    <span>{cat}</span>
                    {categoryCounts[cat] !== undefined && (
                      <span className={`ml-0.5 text-[9px] px-1 py-0.5 rounded-md ${
                        selectedCategory === cat ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800'
                      }`}>
                        {cat === 'All' ? categoryCounts['All'] : categoryCounts[cat]}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {displayedPlaces.length === 0 ? (
              <div className="text-center py-14 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                <p className="text-gray-400 text-sm">No {selectedCategory !== 'All' ? selectedCategory : ''} places found within {selectedRadius} km of this route.</p>
                <button onClick={() => setSelectedCategory('All')} className="mt-2 text-xs text-primary-600 underline">Show all categories</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pagedPlaces.map((place) => {
                    const isSelected = selectedPlace?.id === place.id;
                    return (
                      <motion.div
                        key={place.id}
                        whileHover={{ y: -4 }}
                        className={`bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border-2 transition-all flex flex-col cursor-pointer ${
                          isSelected ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-gray-100 dark:border-gray-800'
                        }`}
                        onClick={() => setSelectedPlace(place)}
                      >
                        {/* Verified place details instead of static imagery */}
                        <div className="relative min-h-44 overflow-hidden bg-[#0a3d26] p-4 text-white">
                          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(135deg, transparent 0 45%, rgba(237,106,32,.6) 45% 46%, transparent 46% 100%)' }} />
                          <div className="relative flex min-h-36 flex-col justify-between gap-4">
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-[#ffb06f] flex items-center gap-1">
                                <MapPin size={12} /> Live place details
                              </span>
                              <span className="text-3xl">{CATEGORY_ICONS[place.category] || place.icon}</span>
                            </div>
                            <div>
                              <h3 className="font-bold text-base leading-snug">{place.name}</h3>
                              <p className="mt-1 text-[11px] text-white/70 truncate">
                                {place.locationAddress || `${place.coordinates?.[0]?.toFixed(4)}, ${place.coordinates?.[1]?.toFixed(4)}`}
                              </p>
                            </div>
                          </div>
                          <span className="absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-white">
                            {CATEGORY_ICONS[place.category] || place.icon} {place.category}
                          </span>
                          {place.distanceFromRouteKm && (
                            <span className="absolute top-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/90 dark:bg-gray-900/90 text-gray-700 dark:text-gray-300 shadow">
                              🛣️ {place.distanceFromRouteKm}
                            </span>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        </div>

                        {/* Content */}
                        <div className="p-4 flex flex-col flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-amber-500 font-bold text-xs flex items-center gap-1">
                              <Star size={13} fill="currentColor" />
                              {(place.rating || 4.0).toFixed(1)}
                              <span className="text-gray-400 font-normal">({place.reviewCount || '—'})</span>
                            </span>
                            {place.isHotel && place.pricePerNight && (
                              <span className="text-xs font-extrabold text-primary-600 dark:text-primary-400">
                                ₹{place.pricePerNight.toLocaleString()}/night
                              </span>
                            )}
                          </div>

                          <h3 className="font-bold text-sm text-gray-900 dark:text-white leading-snug">
                            {place.name}
                          </h3>

                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 flex-1">
                            {place.description}
                          </p>

                          {place.locationAddress && (
                            <p className="text-[11px] text-gray-400 flex items-center gap-1">
                              <MapPin size={11} className="text-primary-500 flex-shrink-0" />
                              <span className="truncate">{place.locationAddress}</span>
                            </p>
                          )}

                          {/* Opening Hours */}
                          {place.openingHours && (
                            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <Clock size={11} className="flex-shrink-0" />
                              <span className="truncate">{place.openingHours}</span>
                            </p>
                          )}

                          {/* CTA Buttons */}
                          <div className="pt-1 flex gap-2">
                            {place.isHotel ? (
                              <>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleOpenHotelBooking(place); }}
                                  className="flex-1 py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-1.5"
                                >
                                  <Hotel size={13} /> Book Now
                                </button>
                                <button
                                  onClick={(e) => handleGetDirections(place, e)}
                                  className="px-2.5 py-2 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-1 border border-emerald-200 dark:border-emerald-800"
                                  title="Open direct Google Maps directions"
                                >
                                  <Navigation size={13} /><span className="hidden sm:inline">Maps</span>
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setDetailPlace(place); }}
                                  className="flex-1 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
                                >
                                  <ExternalLink size={13} /> View Details
                                </button>
                                <button
                                  onClick={(e) => handleGetDirections(place, e)}
                                  className="px-2.5 py-2 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-1 border border-emerald-200 dark:border-emerald-800"
                                  title="Open direct Google Maps directions"
                                >
                                  <Navigation size={13} /><span className="hidden sm:inline">Maps</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Load More */}
                {hasMore && (
                  <div className="text-center">
                    <button
                      onClick={() => setPage(prev => prev + 1)}
                      className="px-6 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 mx-auto shadow-sm"
                    >
                      <ChevronDown size={16} />
                      Load More Places ({displayedPlaces.length - pagedPlaces.length} remaining)
                    </button>
                  </div>
                )}
              </>
            )}

          </div>
        )}
      </div>

      {/* Place Detail Modal */}
      <AnimatePresence>
        {detailPlace && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setDetailPlace(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Verified place header */}
              <div className="relative bg-[#0a3d26] p-5 text-white">
                <button
                  onClick={() => setDetailPlace(null)}
                  className="absolute top-3 right-3 p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                >
                  <X size={16} />
                </button>
                <span className="text-xs font-bold uppercase tracking-widest text-[#ffb06f]">
                  {CATEGORY_ICONS[detailPlace.category] || detailPlace.icon} {detailPlace.category} · Live details
                </span>
                <h3 className="mt-2 text-xl font-extrabold leading-tight">{detailPlace.name}</h3>
                <p className="mt-2 text-xs text-white/70">{detailPlace.locationAddress || 'Verified route location'}</p>
              </div>

              {/* Detail Content */}
              <div className="p-5 space-y-4">
                {/* Rating */}
                <div className="flex items-center justify-between">
                  <span className="text-amber-500 font-bold text-sm flex items-center gap-1">
                    <Star size={15} fill="currentColor" />
                    {(detailPlace.rating || 4.0).toFixed(1)}
                    <span className="text-gray-400 font-normal text-xs">({detailPlace.reviewCount?.toLocaleString() || '—'} reviews)</span>
                  </span>
                  {detailPlace.distanceFromRouteKm && (
                    <span className="text-xs font-bold text-primary-600 dark:text-primary-400">
                      🛣️ {detailPlace.distanceFromRouteKm}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {detailPlace.description}
                </p>

                {/* Info Grid */}
                <div className="space-y-2.5">
                  {detailPlace.locationAddress && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin size={15} className="text-primary-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">{detailPlace.locationAddress}</span>
                    </div>
                  )}
                  {detailPlace.openingHours && (
                    <div className="flex items-start gap-2 text-sm">
                      <Clock size={15} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">{detailPlace.openingHours}</span>
                    </div>
                  )}
                  {detailPlace.contactPhone && (
                    <div className="flex items-start gap-2 text-sm">
                      <Phone size={15} className="text-primary-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">{detailPlace.contactPhone}</span>
                    </div>
                  )}
                  {detailPlace.coordinates && (
                    <div className="flex items-start gap-2 text-xs text-gray-400 font-mono">
                      <Map size={13} className="flex-shrink-0 mt-0.5" />
                      <span>📌 {detailPlace.coordinates[0]?.toFixed(6)}, {detailPlace.coordinates[1]?.toFixed(6)}</span>
                    </div>
                  )}
                  {detailPlace.isHotel && detailPlace.pricePerNight && (
                    <div className="flex items-center gap-2 text-sm font-bold text-primary-600 dark:text-primary-400">
                      <Hotel size={15} className="flex-shrink-0" />
                      <span>₹{detailPlace.pricePerNight.toLocaleString()} / night</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => handleGetDirections(detailPlace)}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-2xl text-sm font-bold shadow-md flex items-center justify-center gap-2"
                  >
                    <Navigation size={16} /> Get Directions
                  </button>
                  {detailPlace.isHotel && (
                    <button
                      onClick={() => { setDetailPlace(null); handleOpenHotelBooking(detailPlace); }}
                      className="flex-1 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-2xl text-sm font-bold shadow-md flex items-center justify-center gap-2"
                    >
                      <Hotel size={16} /> Book Now
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking & Payment Modal Chain */}
      <HotelBookingModal
        hotel={hotelForBooking}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onProceedToPayment={handleProceedToPayment}
      />
      <PaymentModal
        bookingData={pendingBookingPayload}
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />
      <BookingSuccessModal
        booking={confirmedBooking}
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
      />
    </div>
  );
}
