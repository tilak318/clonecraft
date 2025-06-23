const { isValidUrl } = require('../utils/resourceProcessor');

/**
 * Validate scrape request
 */
const validateScrapeRequest = (req, res, next) => {
  const { url, options } = req.body;
  
  if (!url) {
    return res.status(400).json({
      success: false,
      error: 'URL is required'
    });
  }
  
  if (!isValidUrl(url)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid URL format'
    });
  }
  
  // Validate options if provided
  if (options) {
    if (typeof options !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Options must be an object'
      });
    }
    
    if (options.ignoreNoContentFile !== undefined && typeof options.ignoreNoContentFile !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'ignoreNoContentFile must be a boolean'
      });
    }
    
    if (options.beautifyFile !== undefined && typeof options.beautifyFile !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'beautifyFile must be a boolean'
      });
    }
  }
  
  next();
};

/**
 * Validate download request
 */
const validateDownloadRequest = (req, res, next) => {
  const { resources, options } = req.body;
  
  if (!resources) {
    return res.status(400).json({
      success: false,
      error: 'Resources array is required'
    });
  }
  
  if (!Array.isArray(resources)) {
    return res.status(400).json({
      success: false,
      error: 'Resources must be an array'
    });
  }
  
  if (resources.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Resources array cannot be empty'
    });
  }
  
  // Validate each resource
  for (let i = 0; i < resources.length; i++) {
    const resource = resources[i];
    
    if (!resource.url) {
      return res.status(400).json({
        success: false,
        error: `Resource at index ${i} is missing URL`
      });
    }
    
    if (!resource.saveAs || !resource.saveAs.path) {
      return res.status(400).json({
        success: false,
        error: `Resource at index ${i} is missing saveAs.path`
      });
    }
  }
  
  // Validate options if provided
  if (options) {
    if (typeof options !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Options must be an object'
      });
    }
    
    if (options.ignoreNoContentFile !== undefined && typeof options.ignoreNoContentFile !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'ignoreNoContentFile must be a boolean'
      });
    }
    
    if (options.beautifyFile !== undefined && typeof options.beautifyFile !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'beautifyFile must be a boolean'
      });
    }
  }
  
  next();
};

/**
 * Rate limiting middleware (basic implementation)
 */
const rateLimiter = (req, res, next) => {
  // Simple in-memory rate limiting
  const clientIP = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 10; // Max 10 requests per window
  
  // This is a basic implementation - in production, use Redis or similar
  if (!req.app.locals.rateLimit) {
    req.app.locals.rateLimit = new Map();
  }
  
  const clientData = req.app.locals.rateLimit.get(clientIP) || { count: 0, resetTime: now + windowMs };
  
  if (now > clientData.resetTime) {
    clientData.count = 1;
    clientData.resetTime = now + windowMs;
  } else {
    clientData.count++;
  }
  
  req.app.locals.rateLimit.set(clientIP, clientData);
  
  if (clientData.count > maxRequests) {
    return res.status(429).json({
      success: false,
      error: 'Too many requests. Please try again later.'
    });
  }
  
  next();
};

module.exports = {
  validateScrapeRequest,
  validateDownloadRequest,
  rateLimiter
}; 