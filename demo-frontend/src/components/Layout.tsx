import { NavLink, Outlet } from 'react-router-dom';
import { getUsuario, logout } from '../lib/auth';
import DemoBanner from './DemoBanner';
import WelcomeModal from './WelcomeModal';

const nav = [
  { to: '/',            label: 'Dashboard',    icon: '◈',  demo: false },
  { to: '/movimientos', label: 'Movimientos',  icon: '⇄',  demo: false },
  { to: '/cajas',       label: 'Cajas',        icon: '◻',  demo: false },
  { to: '/proveedores', label: 'Proveedores',  icon: '⟳',  demo: false },
  { to: '/mi-cuenta',   label: 'Mi Cuenta',    icon: '👤', demo: false  },
  { to: '/usuarios',    label: 'Usuarios',     icon: '◉',  demo: false },
  { to: '/subempresas', label: 'Subempresas',  icon: '⊞',  demo: false },
  { to: '/claves',      label: 'Claves',       icon: '⌘',  demo: false },
  { to: '/auditoria',   label: 'Auditoría',    icon: '◎',  demo: false },
];

export default function Layout() {
  const usuario = getUsuario();

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Banner demo superior */}
      <DemoBanner />

      {/* Welcome modal */}
      <WelcomeModal />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — dark navy */}
        <aside className="w-52 min-w-52 bg-slate-900 border-r border-slate-800 flex flex-col">
          <div className="p-5 border-b border-slate-800">
            <div className="text-xl font-black tracking-tight text-white">
              CASH<span className="text-blue-400">FLOW</span>
            </div>
            <div className="text-xs text-amber-400 tracking-widest uppercase mt-1 font-bold">
              ⚡ Demo Preview
            </div>
          </div>

          <nav className="flex-1 py-4 overflow-y-auto">
            {nav.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-all border-l-2 ${
                    isActive
                      ? item.demo
                        ? 'text-amber-400 border-amber-400 bg-amber-400/10'
                        : 'text-blue-400 border-blue-400 bg-blue-500/10'
                      : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800'
                  }`
                }
              >
                <span className="text-base w-5 text-center">{item.icon}</span>
                <span>{item.label}</span>

              </NavLink>
            ))}
          </nav>

          {/* Usuario */}
          <div className="p-4 border-t border-slate-800">
            <div className="bg-slate-800 rounded-xl p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-blue-500 flex items-center justify-center text-xs font-bold text-black">
                {usuario?.nombre?.[0] || 'D'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold truncate text-slate-200">{usuario?.nombre}</div>
                <div className="text-xs text-amber-400 font-bold">DEMO</div>
              </div>
              <button
                onClick={logout}
                className="text-slate-500 hover:text-red-400 text-xs"
                title="Cerrar sesión"
              >
                ✕
              </button>
            </div>
          </div>
        </aside>

        {/* Main — fondo blanco */}
        <main className="flex-1 overflow-y-auto bg-gray-50 relative">
          {/* Marca de agua sutil */}
          <div
            className="fixed inset-0 pointer-events-none flex items-center justify-center z-0 select-none overflow-hidden"
            style={{ left: '208px' }}
          >
            <div className="text-gray-200 text-9xl font-black tracking-widest rotate-[-30deg] whitespace-nowrap">
              DEMO
            </div>
          </div>
          <div className="relative z-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
