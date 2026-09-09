import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { Button } from './Common';

export const Navbar = ({ authReady }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Explore', href: '/explore' },
    { label: 'Smart Route', href: '/travel-planner' },
    { label: 'Recommendations', href: '/recommendations', protected: true },
    { label: 'AI Assistant', href: '/ai-assistant' },
    { label: 'About', href: '/about' },
  ];


  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const isActive = (href) => location.pathname === href;

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center" aria-label="Tourist Guide home">
            <img
              src="/tourist-guide-logo.png"
              alt="Tourist Guide"
              className="h-12 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              if (link.protected && !user) return null;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`font-medium transition-colors ${
                    isActive(link.href)
                      ? 'text-primary-500'
                      : 'text-gray-700 dark:text-gray-300 hover:text-primary-500'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Side Controls */}
          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/profile">
                  <Button variant="secondary" size="sm">
                    {user.name}
                  </Button>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : authReady ? (
              <div className="flex gap-2">
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">
                    Register
                  </Button>
                </Link>
              </div>
            ) : null}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden py-4 space-y-3 border-t border-gray-200 dark:border-gray-700"
            >
              {navLinks.map((link) => {
                if (link.protected && !user) return null;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-2 rounded-lg ${
                      isActive(link.href)
                        ? 'bg-primary-100 dark:bg-primary-900 text-primary-600'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                {user ? (
                  <>
                    <Link to="/profile" onClick={() => setIsOpen(false)}>
                      <Button variant="secondary" size="sm" className="w-full">
                        My Profile
                      </Button>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      Logout
                    </button>
                  </>
                ) : authReady ? (
                  <>
                    <Link to="/login" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full">
                        Login
                      </Button>
                    </Link>
                    <Link to="/register" onClick={() => setIsOpen(false)}>
                      <Button size="sm" className="w-full">
                        Register
                      </Button>
                    </Link>
                  </>
                ) : null}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
