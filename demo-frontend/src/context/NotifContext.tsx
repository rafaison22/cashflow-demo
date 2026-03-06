import { createContext, useContext, type ReactNode } from 'react';
import { useNotif } from '../hooks/useNotif';
import Notificaciones from '../components/Notificaciones';

const NotifContext = createContext<ReturnType<typeof useNotif> | null>(null);

export function NotifProvider({ children }: { children: ReactNode }) {
  const notif = useNotif();
  return (
    <NotifContext.Provider value={notif}>
      <Notificaciones notifs={notif.notifs} />
      {children}
    </NotifContext.Provider>
  );
}

export function useNotifContext() {
  const ctx = useContext(NotifContext);
  if (!ctx) throw new Error('useNotifContext debe usarse dentro de NotifProvider');
  return ctx;
}
