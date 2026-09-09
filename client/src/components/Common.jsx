import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseStyles = 'font-semibold rounded-lg transition-all inline-flex items-center justify-center';

  const variants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 shadow-lg hover:shadow-xl',
    secondary: 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600',
    outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-50 dark:hover:bg-gray-900',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export const Card = ({ children, className = '', ...props }) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`card p-6 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const Badge = ({ children, variant = 'primary', className = '' }) => {
  const variants = {
    primary: 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-100',
    secondary: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
    success: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-100',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export const Rating = ({ value, count, onChange, readOnly = true }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => !readOnly && onChange?.(star)}
            className={readOnly ? 'cursor-default' : 'cursor-pointer'}
          >
            <Star
              size={20}
              className={`transition-colors ${
                star <= value
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300 dark:text-gray-600'
              }`}
            />
          </button>
        ))}
      </div>
      {count && <span className="text-sm text-gray-600 dark:text-gray-400">({count})</span>}
    </div>
  );
};

export default { Button, Card, Badge, Rating };
