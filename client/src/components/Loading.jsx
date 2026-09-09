import { Loader } from 'lucide-react';

export const LoadingSpinner = ({ size = 40, text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Loader size={size} className="animate-spin text-primary-500" />
      {text && <p className="mt-4 text-gray-600 dark:text-gray-400">{text}</p>}
    </div>
  );
};

export const SkeletonCard = () => {
  return (
    <div className="bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden animate-pulse">
      <div className="w-full h-48 bg-gray-300 dark:bg-gray-600"></div>
      <div className="p-4 space-y-3">
        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
      </div>
    </div>
  );
};

export const EmptyState = ({ message = 'No data found', icon: Icon }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      {Icon && <Icon size={48} className="text-gray-400 mb-4" />}
      <p className="text-gray-600 dark:text-gray-400 text-lg">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
