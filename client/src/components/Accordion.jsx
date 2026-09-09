import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Accordion = ({ items }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <motion.div
          key={index}
          className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
          initial={false}
        >
          <button
            className="w-full px-6 py-4 text-left font-semibold flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            onClick={() => setActiveIndex(activeIndex === index ? -1 : index)}
          >
            {item.title}
            <motion.div
              animate={{ rotate: activeIndex === index ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown size={20} />
            </motion.div>
          </button>
          <AnimatePresence>
            {activeIndex === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                  {item.content}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
};

export default Accordion;
