import type { Notif } from '../hooks/useNotif';

const ESTILOS: Record<string, string> = {
  exito:       'border-blue-500 text-blue-500',
  error:       'border-red-400 text-red-400',
  info:        'border-blue-400 text-blue-400',
  advertencia: 'border-amber-400 text-amber-400',
};

const ICONOS: Record<string, string> = {
  exito:       '✓',
  error:       '✕',
  info:        'ℹ',
  advertencia: '⚠',
};

export default function Notificaciones({ notifs }: { notifs: Notif[] }) {
  if (notifs.length === 0) return null;

  return (
    <div className="fixed top-16 right-5 z-50 flex flex-col gap-2">
      {notifs.map(n => (
        <div key={n.id}
          className={`bg-slate-800 border rounded-xl px-5 py-3 text-sm font-medium shadow-xl flex items-center gap-3 ${ESTILOS[n.tipo]}`}>
          <span>{ICONOS[n.tipo]}</span>
          <span className="text-slate-200">{n.mensaje}</span>
        </div>
      ))}
    </div>
  );
}
