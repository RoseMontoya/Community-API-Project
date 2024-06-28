const { validationResult, check } = require('express-validator');

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

module.exports = {
  handleValidationErrors,
  venueValidator
};
