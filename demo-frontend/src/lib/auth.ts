import api from './api';

export interface Usuario {
  id:     number;
  nombre: string;
  email:  string;
  rol:    'ADMIN' | 'OPERATIVO';
}

export const login = async (email: string, password: string) => {
  const { data } = await api.post('/auth/login', { email, password });
  localStorage.setItem('token',   data.token);
  localStorage.setItem('usuario', JSON.stringify(data.usuario));
  return data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  window.location.href = '/login';
};

export const getUsuario = (): Usuario | null => {
  const u = localStorage.getItem('usuario');
  return u ? JSON.parse(u) : null;
};

export const isLoggedIn = (): boolean => !!localStorage.getItem('token');
export const isAdmin    = (): boolean => getUsuario()?.rol === 'ADMIN';
