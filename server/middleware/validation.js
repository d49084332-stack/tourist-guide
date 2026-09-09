const { validationResult, body, param, query } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorList = errors.array();
    // Return the specific first message so toast notifications show the exact reason
    const firstErrorMessage = errorList[0]?.msg || 'Validation error';
    return res.status(400).json({
      success: false,
      message: firstErrorMessage,
      errors: errorList.map(err => ({
        field: err.path || err.param,
        message: err.msg
      }))
    });
  }
  next();
};

// Auth validations
const validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  handleValidationErrors
];

const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Destination validations
const validateDestination = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),
  body('state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  body('category')
    .isIn(['Beach', 'Hill Station', 'Historical', 'Religious', 'Adventure', 'Wildlife', 'Nature', 'Heritage', 'Cultural', 'Family', 'Shopping', 'Food', 'Waterfalls'])
    .withMessage('Invalid category'),
  handleValidationErrors
];

// Review validation
const validateReview = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .trim()
    .notEmpty()
    .withMessage('Comment is required')
    .isLength({ min: 10 })
    .withMessage('Comment must be at least 10 characters'),
  handleValidationErrors
];

// Travel plan validation
const validateTravelPlan = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Trip name is required'),
  body('startDate')
    .isISO8601()
    .withMessage('Valid start date is required'),
  body('endDate')
    .isISO8601()
    .withMessage('Valid end date is required'),
  handleValidationErrors
];

// ID parameter validation
const validateId = [
  param('id')
    .matches(/^[0-9a-fA-F]{24}$/)
    .withMessage('Invalid ID format'),
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateDestination,
  validateReview,
  validateTravelPlan,
  validateId,
  handleValidationErrors
};
