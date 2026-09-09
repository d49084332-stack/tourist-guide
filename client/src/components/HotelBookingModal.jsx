import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Users, Bed, Check, ShieldCheck, MapPin, Star, Sparkles } from 'lucide-react';
import { Button } from './Common';

export default function HotelBookingModal({
  hotel,
  isOpen,
  onClose,
  onProceedToPayment
}) {
  if (!isOpen || !hotel) return null;

  // Set default dates: check-in today+1, check-out today+3
  const today = new Date();
  const defaultCheckIn = new Date(today.setDate(today.getDate() + 1)).toISOString().split('T')[0];
  const defaultCheckOut = new Date(today.setDate(today.getDate() + 2)).toISOString().split('T')[0];

  const [selectedRoom, setSelectedRoom] = useState(
    hotel.rooms?.[0] || {
      roomType: 'Deluxe Room',
      roomImage: hotel.images?.[0]?.url || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
      description: 'Air-conditioned luxury room with scenic vistas, premium bedding, and complimentary breakfast.',
      maxGuests: 2,
      facilities: ['King Bed', 'Free Wi-Fi', 'Breakfast Included', 'City View', 'Bathtub'],
      pricePerNight: hotel.pricePerNight || 5500,
      isAvailable: true
    }
  );

  const [checkInDate, setCheckInDate] = useState(defaultCheckIn);
  const [checkOutDate, setCheckOutDate] = useState(defaultCheckOut);
  const [guests, setGuests] = useState(2);
  const [roomsCount, setRoomsCount] = useState(1);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [validationError, setValidationError] = useState('');

  // Calculations
  const calculations = useMemo(() => {
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffTime = end.getTime() - start.getTime();
    const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const pricePerNight = selectedRoom?.pricePerNight || 5000;
    const roomCost = pricePerNight * nights * roomsCount;
    const taxAmount = Math.round(roomCost * 0.12); // 12% GST
    const totalAmount = roomCost + taxAmount;

    return { nights, pricePerNight, roomCost, taxAmount, totalAmount };
  }, [checkInDate, checkOutDate, selectedRoom, roomsCount]);

  const handleConfirm = (e) => {
    e.preventDefault();
    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      setValidationError('Check-out date must be strictly after check-in date.');
      return;
    }
    setValidationError('');

    const bookingPayload = {
      hotelId: hotel._id || hotel.hotelId || null,
      liveHotel: !hotel._id && !hotel.hotelId,
      hotelName: hotel.name,
      hotelAddress: hotel.locationAddress || hotel.location?.address || 'Hotel Corridor',
      hotelCity: hotel.city || hotel.locationAddress || 'Tourist Destination',
      hotelImage: hotel.images?.[0]?.url || hotel.images?.[0] || selectedRoom.roomImage,
      roomType: selectedRoom.roomType,
      roomPricePerNight: calculations.pricePerNight,
      checkInDate,
      checkOutDate,
      guests,
      roomsCount,
      nights: calculations.nights,
      roomCost: calculations.roomCost,
      taxAmount: calculations.taxAmount,
      totalAmount: calculations.totalAmount,
      guestDetails: {
        fullName: guestName || 'Registered Traveler',
        email: guestEmail || 'traveler@touristguide.com',
        phone: guestPhone || '+91 98765 43210'
      },
      specialRequests
    };

    onProceedToPayment(bookingPayload);
  };

  const defaultRooms = hotel.rooms && hotel.rooms.length > 0
    ? hotel.rooms
    : [
        {
          roomType: 'Standard Room',
          roomImage: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
          description: 'Cozy and quiet with ergonomic workstation, tea maker, and high-speed Wi-Fi.',
          maxGuests: 2,
          facilities: ['Queen Bed', 'Free Wi-Fi', 'Air Conditioning', 'LED TV'],
          pricePerNight: Math.round((hotel.pricePerNight || 4500) * 0.8),
          isAvailable: true
        },
        {
          roomType: 'Deluxe Room',
          roomImage: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
          description: 'Spacious room with king bed, scenic view, buffet breakfast, and marble bath.',
          maxGuests: 3,
          facilities: ['King Bed', 'Complimentary Breakfast', 'Mini Bar', 'Bathtub'],
          pricePerNight: hotel.pricePerNight || 5500,
          isAvailable: true
        },
        {
          roomType: 'Executive Suite',
          roomImage: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
          description: 'Opulent multi-room suite with panoramic balcony, living lounge, and butler service.',
          maxGuests: 4,
          facilities: ['Private Lounge', 'Panoramic Balcony', 'Butler Service', 'Jacuzzi'],
          pricePerNight: Math.round((hotel.pricePerNight || 5500) * 1.6),
          isAvailable: true
        }
      ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col border border-gray-100 dark:border-gray-800"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-primary-600 dark:text-primary-400">
                {hotel._id || hotel.hotelId ? 'Hotel Discovery & Booking' : 'Live Hotel Reservation Request'}
              </span>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                🏨 {hotel.name}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="overflow-y-auto p-6 space-y-6 flex-1">
            {/* Hotel Overview Banner */}
            <div className="grid md:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
              <div className="md:col-span-1 rounded-xl overflow-hidden h-40">
                <img
                  src={hotel.images?.[0]?.url || hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'}
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="md:col-span-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-amber-500 font-bold text-sm flex items-center gap-1">
                      <Star size={16} fill="currentColor" /> {hotel.rating || 4.8}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({hotel.reviewCount || 340} reviews)
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 font-semibold">
                      {hotel._id || hotel.hotelId ? 'Instant Confirmation' : 'Live route hotel'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-2">
                    <MapPin size={14} className="text-primary-500" /> {hotel.locationAddress || hotel.location?.address}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-3">
                    {hotel.description}
                  </p>
                </div>
                {hotel.facilities && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {hotel.facilities.slice(0, 5).map((fac, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                        ✓ {fac}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Room Selection Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                  <Bed size={18} className="text-primary-500" /> Choose Available Room
                </h3>
                <span className="text-xs text-gray-500">
                  {defaultRooms.length} room types available
                </span>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {defaultRooms.map((room, idx) => {
                  const isCurrent = selectedRoom?.roomType === room.roomType;
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedRoom(room)}
                      className={`relative flex flex-col justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        isCurrent
                          ? 'border-primary-500 bg-primary-50/40 dark:bg-primary-950/20 shadow-md'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                      }`}
                    >
                      {isCurrent && (
                        <div className="absolute top-2 right-2 bg-primary-500 text-white rounded-full p-1 shadow">
                          <Check size={12} />
                        </div>
                      )}
                      <div>
                        <img
                          src={room.roomImage}
                          alt={room.roomType}
                          className="w-full h-28 object-cover rounded-lg mb-2"
                        />
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-0.5">
                          {room.roomType}
                        </h4>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                          {room.description}
                        </p>
                        <div className="text-[11px] text-gray-600 dark:text-gray-300 space-y-0.5 mb-3">
                          <div className="flex items-center gap-1">
                            <Users size={12} /> Up to {room.maxGuests || 2} guests
                          </div>
                          {room.facilities && (
                            <div className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-1">
                              {room.facilities.slice(0, 3).join(' • ')}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <div>
                          <span className="text-xs text-gray-400">Price/night:</span>
                          <div className="text-base font-extrabold text-primary-600 dark:text-primary-400">
                            ₹{room.pricePerNight?.toLocaleString()}
                          </div>
                        </div>
                        <button
                          type="button"
                          className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-colors ${
                            isCurrent
                              ? 'bg-primary-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-primary-900/50'
                          }`}
                        >
                          {isCurrent ? 'Selected' : 'Select Room'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Booking Details Form */}
            <form onSubmit={handleConfirm} className="space-y-4">
              <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar size={18} className="text-primary-500" /> Booking Dates & Guests
              </h3>

              {validationError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs rounded-xl border border-red-200 dark:border-red-800">
                  {validationError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    required
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    required
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Number of Guests
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium"
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Number of Rooms
                  </label>
                  <select
                    value={roomsCount}
                    onChange={(e) => setRoomsCount(parseInt(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium"
                  >
                    {[1, 2, 3, 4].map(num => (
                      <option key={num} value={num}>{num} Room{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Guest Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Lead Guest Name
                  </label>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Price Calculation Summary Card */}
              <div className="bg-gradient-to-br from-primary-50 to-orange-50 dark:from-gray-800 dark:to-gray-800/60 p-4 rounded-xl border border-primary-100 dark:border-gray-700 space-y-2 mt-4">
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                  <span>Room Type:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{selectedRoom?.roomType}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                  <span>Duration:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {calculations.nights} night{calculations.nights > 1 ? 's' : ''} ({checkInDate} to {checkOutDate})
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                  <span>Room Cost (₹{calculations.pricePerNight.toLocaleString()} × {calculations.nights} night{calculations.nights > 1 ? 's' : ''} × {roomsCount} room{roomsCount > 1 ? 's' : ''}):</span>
                  <span className="font-semibold">₹{calculations.roomCost.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                  <span>Taxes & Tourism Fees (12% GST):</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">+₹{calculations.taxAmount.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-primary-200/60 dark:border-gray-700 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Total Booking Amount:</span>
                    <p className="text-[10px] text-gray-500">Includes all taxes and resort amenities</p>
                  </div>
                  <div className="text-2xl font-extrabold text-primary-600 dark:text-primary-400">
                    ₹{calculations.totalAmount.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" size="lg" className="flex items-center gap-2 shadow-lg">
                  <ShieldCheck size={18} /> Confirm Booking & Proceed to Pay
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
