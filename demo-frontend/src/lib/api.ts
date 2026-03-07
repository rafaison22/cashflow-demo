import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
      return Promise.reject(err);
    }

    if (!err.response) {
      err.mensajeAmigable = 'No se puede conectar con el servidor. Verifica tu conexión.';
    } else if (err.response.status === 500) {
      err.mensajeAmigable = 'Error interno del servidor. Intenta de nuevo en un momento.';
    } else if (err.response.status === 403) {
      err.mensajeAmigable = 'Esta función no está disponible en el modo demo.';
    } else if (err.response.status === 404) {
      err.mensajeAmigable = 'El recurso solicitado no existe.';
    }

    return Promise.reject(err);
  }
);

export default api;