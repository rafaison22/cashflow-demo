import { useState, useEffect } from 'react';
import api from '../lib/api';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    api.get('/usuarios')
      .then(r => setUsuarios(r.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Usuarios</h1>
          <p className="text-gray-500 text-sm mt-1">Gestión de accesos al sistema</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-amber-400/20 text-amber-400 border border-amber-400/30 px-3 py-1.5 rounded-lg font-bold">
            🔒 Modo Demo — Solo lectura
          </span>
          <button disabled
            title="La creación de usuarios no está disponible en el demo"
            className="bg-blue-500/30 text-blue-400 font-bold px-5 py-2.5 rounded-xl text-sm cursor-not-allowed">
            + Nuevo Usuario
          </button>
        </div>
      </div>

      <div className="bg-amber-400/10 border border-amber-400/30 rounded-xl p-4 mb-6 flex items-start gap-3">
        <span className="text-amber-400 text-lg">ℹ</span>
        <div>
          <div className="text-amber-400 font-bold text-sm">Funcionalidad limitada en demo</div>
          <div className="text-gray-500 text-xs mt-1">
            En la versión completa puedes crear, editar y desactivar usuarios, cambiar contraseñas, y gestionar roles (Admin, Operativo).
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-20 animate-pulse text-sm">Cargando...</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {['Nombre', 'Email', 'Rol', 'Estado', 'Desde'].map(h => (
                  <th key={h} className="text-left px-6 py-4 text-xs text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-500 flex items-center justify-center text-xs font-bold text-black">
                        {u.nombre?.[0] || '?'}
                      </div>
                      <span className="text-gray-900 font-medium">{u.nombre}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs font-mono">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      u.rol === 'ADMIN' ? 'bg-blue-100 text-blue-500' : 'bg-blue-400/10 text-blue-400'
                    }`}>
                      {u.rol}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${u.activo ? 'bg-blue-100 text-blue-500' : 'bg-red-400/10 text-red-400'}`}>
                      {u.activo ? '● Activo' : '○ Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs font-mono">
                    {new Date(u.creadoEn).toLocaleDateString('es-MX')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
