const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user exists
    let user = await User.findOne({ email: cleanEmail });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please log in.'
      });
    }

    // Create user
    user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password
    });

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check for user
    let user = await User.findOne({ email: cleanEmail }).select('+password');

    // If demo account requested and not in DB, auto-provision for smooth demonstration
    if (!user) {
      if (cleanEmail === 'user@example.com' && password === 'User@123') {
        user = await User.create({
          name: 'Demo Traveler',
          email: 'user@example.com',
          password: 'User@123',
          role: 'user'
        });
        user = await User.findById(user._id).select('+password');
      } else if (cleanEmail === 'admin@example.com' && password === 'Admin@123') {
        user = await User.create({
          name: 'System Admin',
          email: 'admin@example.com',
          password: 'Admin@123',
          role: 'admin'
        });
        user = await User.findById(user._id).select('+password');
      } else if (cleanEmail === 'traveler@touristguide.com' && password === 'Traveler@123') {
        user = await User.create({
          name: 'Dinesh Kumar',
          email: 'traveler@touristguide.com',
          password: 'Traveler@123',
          role: 'user'
        });
        user = await User.findById(user._id).select('+password');
      }
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
