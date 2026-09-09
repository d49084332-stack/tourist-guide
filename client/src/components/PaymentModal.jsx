import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CreditCard,
  QrCode,
  Smartphone,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { Button } from './Common';
import { bookingAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function PaymentModal({
  bookingData,
  isOpen,
  onClose,
  onPaymentSuccess
}) {
  if (!isOpen || !bookingData) return null;

  const [paymentMethod, setPaymentMethod] = useState('PhonePe');
  const [upiId, setUpiId] = useState('traveler@ybl');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8921');
  const [cardName, setCardName] = useState('Dinesh Kumar');
  const [expiry, setExpiry] = useState('08/28');
  const [cvv, setCvv] = useState('•••');
  const [isProcessing, setIsProcessing] = useState(false);
  const [qrCountdown, setQrCountdown] = useState(240); // 4 minutes

  // QR Code timer countdown
  useEffect(() => {
    if (paymentMethod === 'QR Code') {
      const timer = setInterval(() => {
        setQrCountdown((prev) => (prev > 0 ? prev - 1 : 240));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [paymentMethod]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Simulate secure tokenized payment gateway handshake (2 seconds)
      await new Promise((resolve) => setTimeout(resolve, 1600));

      const payload = {
        hotelId: bookingData.hotelId,
        liveHotel: bookingData.liveHotel,
        hotelName: bookingData.hotelName,
        hotelAddress: bookingData.hotelAddress,
        hotelCity: bookingData.hotelCity,
        roomPricePerNight: bookingData.roomPricePerNight,
        nights: bookingData.nights,
        roomsCount: bookingData.roomsCount,
        roomCost: bookingData.roomCost,
        taxAmount: bookingData.taxAmount,
        totalAmount: bookingData.totalAmount,
        roomType: bookingData.roomType,
        checkInDate: bookingData.checkInDate,
        checkOutDate: bookingData.checkOutDate,
        guests: bookingData.guests,
        paymentMethod: paymentMethod,
        guestDetails: bookingData.guestDetails,
        specialRequests: bookingData.specialRequests
      };

      const response = await bookingAPI.create(payload);

      if (response.data.success) {
        toast.success('Payment verified & booking confirmed!');
        onPaymentSuccess(response.data.booking);
      } else {
        toast.error(response.data.message || 'Payment processing error');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.message || 'Payment transaction failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const paymentOptions = [
    {
      id: 'PhonePe',
      name: 'PhonePe',
      icon: '📱',
      badge: 'Instant UPI',
      description: 'Pay directly via PhonePe UPI app or registered mobile'
    },
    {
      id: 'Google Pay',
      name: 'Google Pay',
      icon: '📱',
      badge: 'GPay UPI',
      description: 'Instant zero-fee payment with Google Pay UPI ID'
    },
    {
      id: 'QR Code',
      name: 'Dynamic QR Code',
      icon: '🔳',
      badge: 'Scan & Pay',
      description: 'Scan dynamic UPI QR code with any banking app'
    },
    {
      id: 'Credit Card',
      name: 'Credit Card',
      icon: '💳',
      badge: 'Visa / MC / Amex',
      description: 'Encrypted end-to-end 256-bit SSL transaction'
    },
    {
      id: 'Debit Card',
      name: 'Debit Card',
      icon: '💳',
      badge: 'RuPay / Visa',
      description: 'Instant OTP debit from all major Indian banks'
    }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[2100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden my-8 border border-gray-100 dark:border-gray-800"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-gray-900">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Lock size={20} />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <ShieldCheck size={14} /> 256-Bit SSL Encrypted Checkout
                </span>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Secure Payment Gateway
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 grid md:grid-cols-5 gap-6">
            {/* Left: Payment Method Selection */}
            <div className="md:col-span-3 space-y-4">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                Select Payment Option:
              </h3>

              <div className="space-y-2">
                {paymentOptions.map((opt) => {
                  const isSelected = paymentMethod === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setPaymentMethod(opt.id)}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-sm'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{opt.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-gray-900 dark:text-white">
                              {opt.name}
                            </span>
                            <span className="text-[10px] px-2 py-0.2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium">
                              {opt.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400">
                            {opt.description}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dynamic Payment Method Input Views */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 mt-4">
                {(paymentMethod === 'PhonePe' || paymentMethod === 'Google Pay') && (
                  <div className="space-y-3">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Enter your {paymentMethod} UPI ID / VPA
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourname@okaxis or mobile@ybl"
                        className="flex-1 text-xs p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      />
                      <span className="px-3 py-2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center">
                        Verified ✓
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500">
                      You will receive a prompt notification on your {paymentMethod} mobile application.
                    </p>
                  </div>
                )}

                {paymentMethod === 'QR Code' && (
                  <div className="text-center py-2 space-y-3">
                    <div className="inline-block p-3 bg-white rounded-2xl shadow-md border border-gray-200">
                      {/* Interactive Simulated Dynamic QR Code SVG */}
                      <svg width="150" height="150" viewBox="0 0 100 100" className="mx-auto">
                        <rect width="100" height="100" fill="white" />
                        <path d="M10,10 h25 v25 h-25 z M15,15 v15 h15 v-15 z M20,20 h5 v5 h-5 z" fill="#0f172a" />
                        <path d="M65,10 h25 v25 h-25 z M70,15 v15 h15 v-15 z M75,20 h5 v5 h-5 z" fill="#0f172a" />
                        <path d="M10,65 h25 v25 h-25 z M15,70 v15 h15 v-15 z M20,75 h5 v5 h-5 z" fill="#0f172a" />
                        <circle cx="50" cy="50" r="14" fill="#10b981" />
                        <text x="50" y="54" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">UPI</text>
                        <path d="M40,20 h5 v10 h-5 z M50,15 h5 v5 h-5 z M45,35 h15 v5 h-15 z M65,45 h5 v10 h-5 z M55,65 h10 v5 h-10 z M75,65 h15 v5 h-15 z M40,75 h8 v8 h-8 z M80,80 h10 v10 h-10 z" fill="#0f172a" />
                      </svg>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-semibold">
                      <Clock size={14} /> Valid for next {formatTimer(qrCountdown)}
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Open PhonePe, GPay, Paytm or BHIM and scan this QR code to pay ₹{bookingData.totalAmount?.toLocaleString()}
                    </p>
                  </div>
                )}

                {(paymentMethod === 'Credit Card' || paymentMethod === 'Debit Card') && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Card Number
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="4532 0000 0000 0000"
                          className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        />
                        <CreditCard size={16} className="absolute right-3 top-3 text-gray-400" />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Expiry
                        </label>
                        <input
                          type="text"
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-center"
                        />
                      </div>
                    </div>

                    <div className="text-[10px] text-gray-400 flex items-center gap-1">
                      <Lock size={12} /> CVV & sensitive cards are strictly tokenized and never stored in database.
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Booking Summary Sidebar */}
            <div className="md:col-span-2 flex flex-col justify-between bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                  Booking Summary
                </h3>

                <div className="flex items-start gap-2.5">
                  <img
                    src={bookingData.hotelImage}
                    alt={bookingData.hotelName}
                    className="w-12 h-12 object-cover rounded-lg shadow-sm"
                  />
                  <div>
                    <h4 className="font-bold text-xs text-gray-900 dark:text-white line-clamp-1">
                      {bookingData.hotelName}
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      {bookingData.roomType}
                    </p>
                    <span className="text-[10px] text-primary-600 dark:text-primary-400 font-semibold">
                      📍 {bookingData.hotelCity}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Check-in:</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">{bookingData.checkInDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Check-out:</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">{bookingData.checkOutDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Stay Duration:</span>
                    <span className="font-medium">{bookingData.nights} night{bookingData.nights > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Guests & Rooms:</span>
                    <span className="font-medium">{bookingData.guests} guests, {bookingData.roomsCount} room</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Payment Via:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{paymentMethod}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-1 text-xs">
                  <div className="flex justify-between text-gray-500">
                    <span>Room Charges:</span>
                    <span>₹{bookingData.roomCost?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>GST (12%):</span>
                    <span>₹{bookingData.taxAmount?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="font-bold text-gray-900 dark:text-white">Grand Total:</span>
                    <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                      ₹{bookingData.totalAmount?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pay Now Button */}
              <div className="pt-4">
                <Button
                  onClick={handleProcessPayment}
                  disabled={isProcessing}
                  size="lg"
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying & Processing...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={18} />
                      <span>Pay ₹{bookingData.totalAmount?.toLocaleString()} via {paymentMethod}</span>
                    </>
                  )}
                </Button>
                <p className="text-[10px] text-center text-gray-400 mt-2">
                  🔒 Bank-grade 256-bit encryption. Safe & instant booking.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
