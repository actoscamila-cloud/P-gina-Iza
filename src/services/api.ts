import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000, // 60s timeout for AI generation and mobile networks
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('roones_token') || localStorage.getItem('vertus_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
