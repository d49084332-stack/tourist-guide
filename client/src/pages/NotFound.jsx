import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../components/Common';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        <div className="w-20 h-20 rounded-3xl bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center mx-auto mb-4">
          <Compass size={44} className="animate-spin [animation-duration:8s]" />
        </div>
        <h1 className="text-6xl font-extrabold gradient-text mb-2">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Off the Beaten Path
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-6">
          The page or travel route you are looking for does not exist or has been relocated.
        </p>
        <div className="flex justify-center gap-3">
          <Link to="/">
            <Button size="md" className="font-bold">
              Return Home
            </Button>
          </Link>
          <Link to="/travel-planner">
            <Button size="md" variant="outline">
              Plan a Route
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
