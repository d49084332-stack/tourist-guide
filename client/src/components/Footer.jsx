import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, LinkedinIcon, Mail } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 dark:bg-black text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold gradient-text mb-4">🌍 Tourist Guide</h3>
            <p className="text-gray-400">
              Discover your next journey with AI-powered personalized travel recommendations.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link to="/" className="hover:text-white transition">Home</Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-white transition">Explore</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition">About</Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-bold mb-4">Features</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition">AI Recommendations</a></li>
              <li><a href="#" className="hover:text-white transition">Travel Planning</a></li>
              <li><a href="#" className="hover:text-white transition">AI Assistant</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4">Contact</h4>
            <div className="space-y-4">
              <p className="text-gray-400 flex items-center gap-2">
                <Mail size={18} />
                info@touristguide.com
              </p>
              <div className="flex gap-4">
                <a href="#" className="hover:text-primary-400 transition">
                  <Facebook size={20} />
                </a>
                <a href="#" className="hover:text-primary-400 transition">
                  <Twitter size={20} />
                </a>
                <a href="#" className="hover:text-primary-400 transition">
                  <Instagram size={20} />
                </a>
                <a href="#" className="hover:text-primary-400 transition">
                  <LinkedinIcon size={20} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
            <p>© {currentYear} AI Smart Tourist Guide. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition">Privacy Policy</a>
              <a href="#" className="hover:text-white transition">Terms of Service</a>
              <a href="#" className="hover:text-white transition">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
