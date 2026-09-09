import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Calendar, MapPin, Download, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from './Common';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';

export default function BookingSuccessModal({
  booking,
  isOpen,
  onClose
}) {
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // Safe fallback if confetti canvas fails
      }
    }
  }, [isOpen]);

  if (!isOpen || !booking) return null;

  const handleGoToAboutCompletedTrips = () => {
    onClose();
    navigate('/about#completed-trips');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[2200] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden my-8 border border-emerald-100 dark:border-emerald-900/40 text-center"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-b from-emerald-500 to-emerald-600 text-white p-8 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
              className="w-20 h-20 bg-white text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl"
            >
              <CheckCircle2 size={46} />
            </motion.div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              ✅ Booking Confirmed!
            </h2>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1">
              Your reservation has been securely completed and confirmed with the hotel.
            </p>
          </div>

          {/* Booking Summary Card */}
          <div className="p-6 space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800/60 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 text-left space-y-3">
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2.5">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400">Booking ID</span>
                  <div className="font-mono text-sm font-extrabold text-primary-600 dark:text-primary-400">
                    {booking.bookingId}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Payment Status</span>
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 justify-end">
                    <ShieldCheck size={14} /> Paid ({booking.paymentMethod})
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-base text-gray-900 dark:text-white">
                  🏨 {booking.hotelName}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                  <MapPin size={13} className="text-primary-500" /> {booking.hotelAddress || booking.hotelCity}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="bg-white dark:bg-gray-900 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                  <span className="text-gray-400 text-[10px] block">Room Type</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">{booking.roomType}</span>
                </div>
                <div className="bg-white dark:bg-gray-900 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                  <span className="text-gray-400 text-[10px] block">Guests & Nights</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {booking.guests} Guests • {booking.nights} Night{booking.nights > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white dark:bg-gray-900 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                  <span className="text-gray-400 text-[10px] block">Check-in</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1">
                    <Calendar size={12} className="text-primary-500" />
                    {new Date(booking.checkInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <div className="bg-white dark:bg-gray-900 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                  <span className="text-gray-400 text-[10px] block">Check-out</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1">
                    <Calendar size={12} className="text-primary-500" />
                    {new Date(booking.checkOutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <span className="text-xs text-gray-500">Total Paid Amount:</span>
                <span className="text-xl font-extrabold text-gray-900 dark:text-white">
                  ₹{booking.totalAmount?.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 py-2.5 text-xs font-semibold"
              >
                Book Another Trip
              </Button>
              <Button
                onClick={handleGoToAboutCompletedTrips}
                className="flex-1 py-2.5 text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center gap-1.5 shadow-md"
              >
                <span>View in Completed Trips</span>
                <ArrowRight size={14} />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
