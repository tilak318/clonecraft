import axios from 'axios';

const baseURL = process.env.NODE_ENV === 'production'
  ? 'https://server-websitesucker.onrender.com/api'
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
});

export default api; 