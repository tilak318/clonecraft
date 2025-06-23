// Database configuration
// Currently using in-memory storage, but can be extended to use MongoDB, PostgreSQL, etc.

const config = {
  // In-memory storage for now
  storage: {
    type: 'memory',
    // For future database integration
    // type: 'mongodb',
    // url: process.env.MONGODB_URI || 'mongodb://localhost:27017/resources-saver',
  },
  
  // Cache configuration
  cache: {
    enabled: true,
    ttl: 3600, // 1 hour
    maxSize: 100 // Maximum number of cached items
  }
};

module.exports = config; 