import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  let token;
  
  if (config.url.includes('/admin') || config.url.includes('/rank-admin')) {
    token = localStorage.getItem('token');
  } else if (config.url.includes('/rank-')) {
    token = localStorage.getItem('r_token');
  } else {
    token = localStorage.getItem('e_token');
  }
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
