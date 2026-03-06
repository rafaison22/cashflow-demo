import { useState, useCallback } from 'react';

export interface Notif {
  id: number;
  mensaje: string;
  tipo: 'exito' | 'error' | 'info' | 'advertencia';
}

export const useNotif = () => {
  const [notifs, setNotifs] = useState<Notif[]>([]);

  const agregar = useCallback((mensaje: string, tipo: Notif['tipo']) => {
    const id = Date.now();
    setNotifs((prev) => [...prev, { id, mensaje, tipo }]);
    setTimeout(() => {
      setNotifs((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  }, []);

  const exito = (msg: string) => agregar(msg, 'exito');
  const error = (msg: string) => agregar(msg, 'error');

  return { notifs, exito, error };
};
