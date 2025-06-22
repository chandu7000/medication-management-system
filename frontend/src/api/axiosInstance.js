// frontend/src/api/axiosInstance.js

import axios from 'axios';

// Create instance with base URL
const axiosInstance = axios.create({
  baseURL: 'https://medication-backend-5.onrender.com/api', // Adjust if needed
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach token to every request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
