import axios from 'axios';

console.log('VITE_API_URL =', import.meta.env.VITE_API_URL);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;

  console.log('REQUEST', {
    baseURL: config.baseURL,
    url: config.url,
    full: `${config.baseURL}${config.url}`,
  });

  return config;
});

export default api;
