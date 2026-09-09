// Stub pages directory structure
// These files need to be created with full implementations

import { motion } from 'framer-motion';
import { Button } from '../../components/Common';
import { Link } from 'react-router-dom';

export const DestinationDetails = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
    <div className="max-w-7xl mx-auto px-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-4xl font-bold mb-4">Destination Details</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          This page will display detailed information about a destination, including images, reviews, and recommendations.
        </p>
        <Link to="/explore">
          <Button>← Back to Explore</Button>
        </Link>
      </motion.div>
    </div>
  </div>
);

export const Recommendations = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
    <div className="max-w-7xl mx-auto px-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-4xl font-bold mb-4">AI Recommendations</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Personalized destination recommendations based on your preferences and behavior.
        </p>
        <Button>Generate Recommendations</Button>
      </motion.div>
    </div>
  </div>
);

export const Favorites = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
    <div className="max-w-7xl mx-auto px-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-4xl font-bold mb-4">My Favorites</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          View and manage your favorite destinations.
        </p>
        <Link to="/explore">
          <Button>Explore More Destinations</Button>
        </Link>
      </motion.div>
    </div>
  </div>
);

export const Profile = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
    <div className="max-w-7xl mx-auto px-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-4xl font-bold mb-4">My Profile</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Manage your profile, preferences, and account settings.
        </p>
      </motion.div>
    </div>
  </div>
);

export const TravelPlanner = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
    <div className="max-w-7xl mx-auto px-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-4xl font-bold mb-4">Travel Planner</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Create and manage your travel itineraries.
        </p>
        <Button>Create New Travel Plan</Button>
      </motion.div>
    </div>
  </div>
);

export const AiAssistant = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
    <div className="max-w-7xl mx-auto px-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-4xl font-bold mb-4">AI Travel Assistant</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Chat with our AI assistant for personalized travel recommendations.
        </p>
      </motion.div>
    </div>
  </div>
);

export const AdminDashboard = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
    <div className="max-w-7xl mx-auto px-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-4xl font-bold mb-4">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Manage destinations, users, and view analytics.
        </p>
      </motion.div>
    </div>
  </div>
);

export const NotFound = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      <h1 className="text-6xl font-bold mb-4 gradient-text">404</h1>
      <p className="text-2xl font-semibold mb-2">Page Not Found</p>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        The page you're looking for doesn't exist.
      </p>
      <Link to="/">
        <Button size="lg">Go to Home</Button>
      </Link>
    </motion.div>
  </div>
);
