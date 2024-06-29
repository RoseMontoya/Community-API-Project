const { validationResult, check,  } = require('express-validator');

// middleware for formatting errors from express-validator middleware
// (to customize, see express-validator's documentation)
const handleValidationErrors = (req, _res, next) => {
  const validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {
    const errors = {};
    validationErrors
      .array()
      .forEach(error => errors[error.path] = error.msg);

    const err = Error("Bad request.");
    err.errors = errors;
    err.status = 400;
    err.title = "Bad request.";
    next(err);
  }
  next();
};

const venueValidator = [
  check('address')
      .exists({ checkFalsy: true })
      .withMessage('Street address is required'),
  check('city')
      .exists({ checkFalsy: true})
      .withMessage('City is required'),
  check('state')
      .exists({ checkFalsy: true})
      .withMessage('State is required'),
  check('lat')
      .exists({ checkFalsy: true})
      .isFloat({ min: -90, max: 90})
      .withMessage('Latitude must be within -90 and 90'),
  check('lng')
      .exists({ checkFalsy: true})
      .isFloat({ min: -180, max: 180})
      .withMessage('Longitude must be within -180 and 180'),
  handleValidationErrors
]

const eventValidator = [
  check('name')
    .exists({checkFalsy: true })
    .isLength({ min: 5})
    .withMessage('Name must be at least 5 characters'),
  check('type')
    .exists({ checkFalsy: true })
    .isIn(['Online', 'In person'])
    .withMessage('Type must be Online or In person'),
  check('capacity')
    .exists({ checkFalsy: true })
    .isInt({ min: 0 })
    .withMessage('Capacity must be an integer'),
  check('price')
    .exists({ checkFalsy: true })
    .isFloat({ min: 0})
    .withMessage('Price is invalid'),
  check('price')
    .customSanitizer((value) => {
      return +(Number(value).toFixed(2));
    }),
  check('description')
    .exists({ checkFalsy: true })
    .withMessage('Description is required'),
  check('startDate')
    .exists({ checkFalsy: true })
    .custom( value => {
      const current = new Date();
      const startDate = new Date(value)

      if (current > startDate) throw new Error('Start date must be in the future');
      else return true
    }),
  check('endDate')
    .exists({ checkFalsy: true })
    .custom((value, {req} )=> {
      const startDate = new Date(req.body.startDate)
      const endDate = new Date(value)

      if (endDate < startDate) throw new Error('End date is less than start date');
      else return true;
    }),
  handleValidationErrors
]

const queryValidator = [
  check('page')
    .optional()
    .isInt({ min: 1})
    .withMessage('Page must be greater than or equal to 1'),
  check('size')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Size must be greater than or equal to 1'),
  check('name')
    .optional()
    .isEmpty()
    .withMessage('Name must be a string'),
  check('type')
    .optional()
    .isIn(['Online', 'In Person'])
    .withMessage(`Type must be 'Online' or 'In Person'`),
  check('startDate')
    .optional()
    .isDate({ format: 'YYYY-MM-DD'})
    .isAfter(new Date().toISOString())
    .withMessage('Start date must be a valid datetime'),
  handleValidationErrors
]

const attendanceValidator = [
   check('status')
    .exists({ checkFalsy: true })
    .isIn(['attending', 'waitlist'])
    .withMessage('Cannot change an attendance status to pending'),
  handleValidationErrors
]

module.exports = {
  handleValidationErrors,
  venueValidator,
  eventValidator,
  queryValidator,
  attendanceValidator
};
