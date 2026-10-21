const { validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const safeErrors = errors.array().map(({ type, location, path, param, msg }) => ({
      type,
      location,
      field: path || param,
      message: msg,
    }));
    return res.status(422).json({ errors: safeErrors });
  }
  next();
};

module.exports = validateRequest;
