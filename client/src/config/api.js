// API Configuration
const API_CONFIG = {
  // Development environment
  development: {
    baseURL: 'http://localhost:5000'
  },
  // Production environment
  production: {
    baseURL: 'https://server-clonecraft-production-b992.up.railway.app'
  }
};

// Get current environment
const environment = process.env.NODE_ENV || 'development';

// Export the appropriate configuration
export const API_BASE_URL = API_CONFIG[environment].baseURL;

// Default axios configuration
export const axiosConfig = {
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds
  headers: {
    'Content-Type': 'application/json'
  }
};

export default API_CONFIG[environment]; 