import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to /login if there was a saved token that expired, and not already on auth pages
    if (
      error.response?.status === 401 &&
      !window.location.pathname.includes('/login') &&
      !window.location.pathname.includes('/register')
    ) {
      const hasToken = Boolean(localStorage.getItem('token'));
      if (hasToken) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  getMe: () => apiClient.get('/auth/me'),
};

export const userAPI = {
  getProfile: () => apiClient.get('/user/profile'),
  updateProfile: (data) => apiClient.put('/user/profile', data),
  updatePreferences: (data) => apiClient.put('/user/preferences', data),
  getSearchHistory: () => apiClient.get('/user/search-history'),
  addSearchHistory: (query) => apiClient.post('/user/search-history', { query }),
};

export const destinationAPI = {
  getAll: (params) => apiClient.get('/destinations', { params }),
  aiDiscover: (params) => apiClient.get('/destinations/ai-discover', { params }),
  getLiveBeaches: (params) => apiClient.get('/destinations/live-beaches', { params }),
  getById: (id) => apiClient.get(`/destinations/${id}`),
  getPopular: () => apiClient.get('/destinations/popular'),
  getFeatured: () => apiClient.get('/destinations/featured'),
  getByCategory: (category) => apiClient.get(`/destinations/category/${category}`),
  create: (data) => apiClient.post('/destinations', data),
  update: (id, data) => apiClient.put(`/destinations/${id}`, data),
  delete: (id) => apiClient.delete(`/destinations/${id}`),
};

export const favoriteAPI = {
  add: (destinationId) => apiClient.post(`/favorites/${destinationId}`),
  remove: (destinationId) => apiClient.delete(`/favorites/${destinationId}`),
  getAll: () => apiClient.get('/favorites'),
  check: (destinationId) => apiClient.get(`/favorites/check/${destinationId}`),
};

export const reviewAPI = {
  create: (data) => apiClient.post('/reviews', data),
  getByDestination: (destinationId, params) => 
    apiClient.get(`/reviews/${destinationId}`, { params }),
  getUserReview: (destinationId) => apiClient.get(`/reviews/user/${destinationId}`),
  update: (id, data) => apiClient.put(`/reviews/${id}`, data),
  delete: (id) => apiClient.delete(`/reviews/${id}`),
};

export const travelPlanAPI = {
  getAll: () => apiClient.get('/travel-plans'),
  getById: (id) => apiClient.get(`/travel-plans/${id}`),
  create: (data) => apiClient.post('/travel-plans', data),
  update: (id, data) => apiClient.put(`/travel-plans/${id}`, data),
  delete: (id) => apiClient.delete(`/travel-plans/${id}`),
  addDestination: (id, data) => apiClient.post(`/travel-plans/${id}/destinations`, data),
  removeDestination: (id, destinationId) => 
    apiClient.delete(`/travel-plans/${id}/destinations/${destinationId}`),
};

export const recommendationAPI = {
  getAll: (params) => apiClient.get('/recommendations', { params }),
  generate: () => apiClient.post('/recommendations/generate'),
  getHistory: (params) => apiClient.get('/recommendations/history', { params }),
};

export const chatAPI = {
  sendMessage: (data) => apiClient.post('/chat/message', data),
  getHistory: (params) => apiClient.get('/chat/history', { params }),
  getChat: (id) => apiClient.get(`/chat/${id}`),
  deleteChat: (id) => apiClient.delete(`/chat/${id}`),
  clearAll: () => apiClient.delete('/chat/all'),
};

export const hotelAPI = {
  getAll: (params) => apiClient.get('/hotels', { params }),
  getById: (id) => apiClient.get(`/hotels/${id}`),
};

export const bookingAPI = {
  create: (data) => apiClient.post('/bookings', data),
  getMyBookings: (params) => apiClient.get('/bookings/my-bookings', { params }),
  getById: (id) => apiClient.get(`/bookings/${id}`),
  completeTrip: (id, data) => apiClient.put(`/bookings/${id}/complete-trip`, data),
  cancel: (id) => apiClient.put(`/bookings/${id}/cancel`),
};

export const routeAPI = {
  plan: (params) => apiClient.get('/routes/plan', { params }),
  getPopular: () => apiClient.get('/routes/popular'),
  reverseGeocode: (params) => apiClient.get('/routes/reverse-geocode', { params }),
};


export const feedbackAPI = {
  submit: (data) => apiClient.post('/feedback', data),
  getAll: (params) => apiClient.get('/feedback', { params }),
};


export const adminAPI = {
  getDashboard: () => apiClient.get('/admin/dashboard'),
  getUsers: (params) => apiClient.get('/admin/users', { params }),
  getUserDetails: (id) => apiClient.get(`/admin/users/${id}`),
  getFeedback: (params) => apiClient.get('/admin/feedback', { params }),
  deleteFeedback: (id) => apiClient.delete(`/admin/feedback/${id}`),
  getDestinations: (params) => apiClient.get('/admin/destinations', { params }),
  getRecommendations: (params) => apiClient.get('/admin/recommendations', { params }),
};

export default apiClient;

