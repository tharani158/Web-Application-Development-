const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || (res.statusCode === 200 ? 500 : res.statusCode);
  if (err.message === 'Origin not allowed by CORS') statusCode = 403;
  let message = err.message || 'Server error';
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource identifier';
  } else if (err.name === 'ValidationError') {
    statusCode = 422;
  } else if (err.code === 11000) {
    statusCode = 409;
    message = 'A record with this value already exists';
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Not authorized, token invalid';
  }
  if (process.env.NODE_ENV === 'production' && statusCode >= 500) message = 'Server error';
  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

module.exports = { errorHandler };
