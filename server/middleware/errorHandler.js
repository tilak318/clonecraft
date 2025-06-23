/**
 * Error handling middleware for Express
 */

// Error logger
const errorLogger = (err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  next(err);
};

// Error handler
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  // Don't leak error details in production
  const error = process.env.NODE_ENV === 'production' 
    ? { message: 'Something went wrong' }
    : { message, stack: err.stack };
  
  res.status(statusCode).json({
    success: false,
    error: error.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
  });
};

// 404 handler
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path
  });
};

// Validation error handler
const validationErrorHandler = (err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: err.message
    });
  }
  next(err);
};

module.exports = {
  errorLogger,
  errorHandler,
  notFoundHandler,
  validationErrorHandler
}; 