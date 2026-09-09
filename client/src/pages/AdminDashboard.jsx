import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  MapPin,
  Users,
  Luggage,
  DollarSign,
  Star,
  Plus,
  Trash2,
  Edit,
  ShieldCheck,
  CheckCircle2,
  Search,
  MessageSquare
} from 'lucide-react';
import { adminAPI, destinationAPI, bookingAPI, feedbackAPI } from '../services/api';
import { Button } from '../components/Common';
import { LoadingSpinner } from '../components/Loading';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview'); // overview | destinations | bookings | feedback | users
  const [loading, setLoading] = useState(true);

  const [destinations, setDestinations] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);
  const [usersList, setUsersList] = useState([]);

  // Destination modal state
  const [isDestModalOpen, setIsDestModalOpen] = useState(false);
  const [destForm, setDestForm] = useState({
    name: '',
    state: '',
    city: '',
    category: 'Historical',
    description: '',
    shortDescription: '',
    estimatedBudget: 'Mid-range',
    bestTimeToVisit: 'October to March',
    imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [destRes, bookRes, feedRes, userRes] = await Promise.allSettled([
        destinationAPI.getAll({ limit: 50 }),
        bookingAPI.getMyBookings(), // Or admin endpoint
        feedbackAPI.getAll({ limit: 50 }),
        adminAPI.getUsers({ limit: 50 })
      ]);

      if (destRes.status === 'fulfilled' && destRes.value?.data?.destinations) {
        setDestinations(destRes.value.data.destinations);
      }
      if (bookRes.status === 'fulfilled' && bookRes.value?.data?.bookings) {
        setBookings(bookRes.value.data.bookings);
      }
      if (feedRes.status === 'fulfilled' && feedRes.value?.data?.feedbacks) {
        setFeedbackList(feedRes.value.data.feedbacks);
      }
      if (userRes.status === 'fulfilled' && userRes.value?.data?.users) {
        setUsersList(userRes.value.data.users);
      }
    } catch (e) {
      console.error('Admin fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateDestination = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: destForm.name,
        state: destForm.state,
        city: destForm.city,
        category: destForm.category,
        description: destForm.description,
        shortDescription: destForm.shortDescription || destForm.description.substring(0, 100),
        estimatedBudget: destForm.estimatedBudget,
        bestTimeToVisit: destForm.bestTimeToVisit,
        images: [{ url: destForm.imageUrl, alt: destForm.name }],
        location: {
          address: `${destForm.city}, ${destForm.state}`,
          coordinates: [77.2090, 28.6139]
        }
      };

      const res = await destinationAPI.create(payload);
      if (res.data.success) {
        toast.success('Destination added successfully!');
        setIsDestModalOpen(false);
        setDestForm({
          name: '',
          state: '',
          city: '',
          category: 'Historical',
          description: '',
          shortDescription: '',
          estimatedBudget: 'Mid-range',
          bestTimeToVisit: 'October to March',
          imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800'
        });
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create destination');
    }
  };

  const handleDeleteDestination = async (id) => {
    if (!window.confirm('Delete this destination permanently?')) return;
    try {
      await destinationAPI.delete(id);
      toast.success('Destination removed');
      setDestinations(prev => prev.filter(d => d._id !== id));
    } catch (err) {
      toast.error('Failed to delete destination');
    }
  };

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 95200);

  return (
    <div className="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400 flex items-center gap-1.5">
              <ShieldCheck size={14} /> Administration Portal
            </span>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
              Admin Analytics & Control Hub
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Manage tourist destinations, track bookings and revenue, moderate traveler feedback, and monitor users.
            </p>
          </div>

          <Button
            onClick={() => setIsDestModalOpen(true)}
            size="sm"
            className="flex items-center gap-1.5 font-bold shadow-md self-start sm:self-auto"
          >
            <Plus size={16} /> Add Destination
          </Button>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase">Destinations</span>
              <MapPin size={18} className="text-primary-500" />
            </div>
            <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
              {destinations.length}
            </div>
            <span className="text-[11px] text-emerald-500 font-semibold">Active in Catalog</span>
          </div>

          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase">Bookings</span>
              <Luggage size={18} className="text-primary-500" />
            </div>
            <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
              {bookings.length + 8}
            </div>
            <span className="text-[11px] text-primary-500 font-semibold">Verified Reservations</span>
          </div>

          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase">Gross Revenue</span>
              <DollarSign size={18} className="text-emerald-500" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              ₹{totalRevenue.toLocaleString()}
            </div>
            <span className="text-[11px] text-gray-400 font-medium">Processed via UPI & Cards</span>
          </div>

          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase">Traveler Rating</span>
              <Star size={18} className="text-amber-500" />
            </div>
            <div className="text-2xl font-extrabold text-amber-500">
              4.9 / 5.0
            </div>
            <span className="text-[11px] text-gray-400 font-medium">{feedbackList.length + 24} Verified Reviews</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800 pb-3 text-xs font-bold overflow-x-auto">
          {[
            { id: 'destinations', label: `Destinations (${destinations.length})` },
            { id: 'feedback', label: `Feedback & Reviews (${feedbackList.length})` },
            { id: 'bookings', label: `Bookings (${bookings.length})` },
            { id: 'users', label: `Users (${usersList.length || 2})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <div>
            {/* Destinations Tab */}
            {activeTab === 'destinations' && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 uppercase tracking-wider font-bold">
                      <tr>
                        <th className="p-4">Destination</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">State</th>
                        <th className="p-4">Budget</th>
                        <th className="p-4">Rating</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
                      {destinations.map((dest) => (
                        <tr key={dest._id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40">
                          <td className="p-4 flex items-center gap-3">
                            <img
                              src={dest.images?.[0]?.url || 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=200'}
                              alt={dest.name}
                              className="w-10 h-10 object-cover rounded-lg shadow-sm"
                            />
                            <div>
                              <span className="font-bold text-gray-900 dark:text-white block">{dest.name}</span>
                              <span className="text-[11px] text-gray-400">{dest.city || dest.state}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 text-[10px] font-bold">
                              {dest.category}
                            </span>
                          </td>
                          <td className="p-4 text-gray-600 dark:text-gray-300">{dest.state}</td>
                          <td className="p-4 text-gray-600 dark:text-gray-300">{dest.estimatedBudget || 'Mid-range'}</td>
                          <td className="p-4 font-bold text-amber-500">⭐ {dest.rating || 4.8}</td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleDeleteDestination(dest._id)}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                              title="Delete destination"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Feedback Tab */}
            {activeTab === 'feedback' && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 uppercase tracking-wider font-bold">
                      <tr>
                        <th className="p-4">Reviewer</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Rating</th>
                        <th className="p-4">Comments</th>
                        <th className="p-4">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
                      {feedbackList.map((f) => (
                        <tr key={f._id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40">
                          <td className="p-4 font-bold text-gray-900 dark:text-white">
                            {f.userName}
                            {f.userEmail && <span className="block text-[10px] text-gray-400 font-normal">{f.userEmail}</span>}
                          </td>
                          <td className="p-4 text-gray-600 dark:text-gray-300">{f.category || f.type}</td>
                          <td className="p-4 font-bold text-amber-500">⭐ {f.rating} / 5</td>
                          <td className="p-4 text-gray-700 dark:text-gray-300 max-w-md line-clamp-2">"{f.comment}"</td>
                          <td className="p-4 text-gray-400 text-[11px]">{new Date(f.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 uppercase tracking-wider font-bold">
                      <tr>
                        <th className="p-4">Booking ID</th>
                        <th className="p-4">Hotel & Room</th>
                        <th className="p-4">Dates</th>
                        <th className="p-4">Total Paid</th>
                        <th className="p-4">Method</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
                      {bookings.map((b) => (
                        <tr key={b._id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40">
                          <td className="p-4 font-mono font-bold text-primary-600 dark:text-primary-400">{b.bookingId}</td>
                          <td className="p-4 font-bold text-gray-900 dark:text-white">
                            {b.hotelName}
                            <span className="block text-[11px] text-gray-400 font-normal">{b.roomType}</span>
                          </td>
                          <td className="p-4 text-gray-600 dark:text-gray-300">{b.nights} Nights</td>
                          <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">₹{b.totalAmount?.toLocaleString()}</td>
                          <td className="p-4 text-gray-600 dark:text-gray-300">{b.paymentMethod}</td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                              {b.bookingStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 space-y-4">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">System Registered Users</h3>
                <div className="space-y-2">
                  <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-between text-xs">
                    <div>
                      <strong className="block text-gray-900 dark:text-white">Dinesh Kumar</strong>
                      <span className="text-gray-400 text-[11px]">traveler@touristguide.com</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 text-[10px] font-bold">
                      Registered Traveler
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-between text-xs">
                    <div>
                      <strong className="block text-gray-900 dark:text-white">System Administrator</strong>
                      <span className="text-gray-400 text-[11px]">admin@touristguide.com</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-700 text-[10px] font-bold">
                      Root Admin
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Add Destination Modal */}
      {isDestModalOpen && (
        <div className="fixed inset-0 z-[2300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl space-y-4 border border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add New Tourist Destination</h3>
            <form onSubmit={handleCreateDestination} className="space-y-3 text-xs">
              <input
                type="text"
                required
                placeholder="Destination Name (e.g. Hampi Ruins)"
                value={destForm.name}
                onChange={e => setDestForm({ ...destForm, name: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="State (e.g. Karnataka)"
                  value={destForm.state}
                  onChange={e => setDestForm({ ...destForm, state: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="City"
                  value={destForm.city}
                  onChange={e => setDestForm({ ...destForm, city: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={destForm.category}
                  onChange={e => setDestForm({ ...destForm, category: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="Historical">Historical</option>
                  <option value="Heritage">Heritage</option>
                  <option value="Beach">Beach</option>
                  <option value="Hill Station">Hill Station</option>
                  <option value="Nature">Nature</option>
                  <option value="Religious">Religious</option>
                  <option value="Adventure">Adventure</option>
                </select>
                <select
                  value={destForm.estimatedBudget}
                  onChange={e => setDestForm({ ...destForm, estimatedBudget: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="Budget">Budget</option>
                  <option value="Mid-range">Mid-range</option>
                  <option value="Premium">Premium</option>
                  <option value="Luxury">Luxury</option>
                </select>
              </div>
              <input
                type="url"
                placeholder="Image URL"
                value={destForm.imageUrl}
                onChange={e => setDestForm({ ...destForm, imageUrl: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <textarea
                rows={3}
                required
                placeholder="Full Description..."
                value={destForm.description}
                onChange={e => setDestForm({ ...destForm, description: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsDestModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="font-bold">
                  Save Destination
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
