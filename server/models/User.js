const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false // Don't return password by default
  },
  avatar: {
    type: String,
    default: 'https://via.placeholder.com/150?text=User'
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  preferences: {
    interests: [String], // Beach, Mountain, Historical, etc.
    budget: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Luxury'],
      default: 'Medium'
    },
    travelStyle: String,
    preferredActivities: [String],
    preferredLocations: [String],
    tripDuration: String
  },
  favoriteDestinations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Destination'
  }],
  searchHistory: [{
    query: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  viewedDestinations: [{
    destinationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
