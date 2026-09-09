import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingAiChat from './components/FloatingAiChat';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Explore from './pages/Explore';
import {
  DestinationDetails,
  Recommendations,
  Favorites,
  Profile,
  TravelPlanner,
  AiAssistant,
  AdminDashboard,
  About,
  NotFound
} from './pages/index.js';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

function App() {
  const { initAuth, user, initialized } = useAuthStore();
  const { initTheme } = useThemeStore();

  useEffect(() => {
    initAuth();
    initTheme();
  }, []);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="flex flex-col min-h-screen">
        <Navbar authReady={initialized} />
        <main className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/destinations/:id" element={<DestinationDetails />} />
            <Route path="/about" element={<About />} />
            <Route path="/travel-planner" element={<TravelPlanner />} />
            <Route path="/smart-route" element={<TravelPlanner />} />

            {/* Auth Routes */}
            <Route 
              path="/login" 
              element={user ? <Navigate to="/" /> : <Login />} 
            />
            <Route 
              path="/register" 
              element={user ? <Navigate to="/" /> : <Register />} 
            />

            {/* Protected Routes */}
            <Route 
              path="/recommendations" 
              element={
                <ProtectedRoute>
                  <Recommendations />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/favorites" 
              element={
                <ProtectedRoute>
                  <Favorites />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/ai-assistant" 
              element={<AiAssistant />} 
            />

            {/* Admin Routes */}
            <Route 
              path="/admin/*" 
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } 
            />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <FloatingAiChat />
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;

