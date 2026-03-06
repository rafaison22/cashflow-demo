import { useState, useEffect } from 'react';
import api from '../lib/api';

const fmt = (n: number) => '$' + Number(n).toLocaleString('es-MX', { minimumFractionDigits: 0 });

const EMPRESAS = [
  { id: 1, nombre: 'APE' },
  { id: 2, nombre: 'SMN' },
  { id: 3, nombre: 'PROMOTORA' },
];

export default function Subempresas() {
  const [metricas,  setMetricas]  = useState<any[]>([]);
  const [subempresas, setSubempresas] = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [notif,     setNotif]     = useState('');
  const [error,     setError]     = useState('');
  const [filtroEmpresa, setFiltroEmpresa] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState({ nombre: '', empresaId: '1' });

  const notificar = (msg: string, esError = false) => {
    if (esError) setError(msg); else setNotif(msg);
    setTimeout(() => { setNotif(''); setError(''); }, 3500);
  };

  const cargar = async () => {
    setLoading(true);
    try {
      const params = filtroEmpresa ? { empresaId: filtroEmpresa } : {};
      const [metRes, subRes] = await Promise.all([
        api.get('/subempresas/metricas', { params }),
        api.get('/subempresas',          { params }),
      ]);
      setMetricas(metRes.data);
      setSubempresas(subRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, [filtroEmpresa]);

  const crear = async () => {
    if (!form.nombre) return notificar('El nombre es requerido', true);
    setGuardando(true);
    try {
      await api.post('/subempresas', {
        nombre:    form.nombre,
        empresaId: Number(form.empresaId),
      });
      setShowModal(false);
      setForm({ nombre: '', empresaId: '1' });
      notificar('Subempresa creada correctamente');
      cargar();
    } catch (e: any) {
      notificar(e.response?.data?.error || 'Error al crear', true);
    } finally {
      setGuardando(false);
    }
  };

  // Totales globales
  const totalEntradas  = metricas.reduce((a, m) => a + m.entradas,  0);
  const totalSalidas   = metricas.reduce((a, m) => a + m.salidas,   0);
  const totalFlujo     = metricas.reduce((a, m) => a + m.flujoNeto, 0);

  return (
    <div className="p-8">
      {notif && (
        <div className="fixed top-5 right-5 z-50 bg-gray-100 border border-blue-500 rounded-xl px-5 py-3 text-sm text-blue-500 font-medium shadow-xl">
          ✓ {notif}
        </div>
      )}
      {error && (
        <div className="fixed top-5 right-5 z-50 bg-gray-100 border border-red-400 rounded-xl px-5 py-3 text-sm text-red-400 font-medium shadow-xl">
          ✕ {error}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Subempresas</h1>
          <p className="text-gray-500 text-sm mt-1">{subempresas.length} subempresas registradas</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm">
          + Nueva Subempresa
        </button>
      </div>

      {/* Filtro empresa */}
      <div className="flex gap-3 mb-6">
        {[{ id: '', nombre: 'Todas' }, ...EMPRESAS].map(e => (
          <button key={e.id}
            onClick={() => setFiltroEmpresa(String(e.id))}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              filtroEmpresa === String(e.id)
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-500 hover:text-gray-900 border border-gray-300'
            }`}>
            {e.nombre}
          </button>
        ))}
      </div>

      {/* KPIs globales */}
      {metricas.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Entradas',  value: fmt(totalEntradas),  color: 'blue', top: 'bg-blue-500' },
            { label: 'Total Salidas',   value: fmt(totalSalidas),   color: 'red',     top: 'bg-red-400' },
            { label: 'Flujo Neto',      value: fmt(totalFlujo),     color: totalFlujo >= 0 ? 'blue' : 'red', top: totalFlujo >= 0 ? 'bg-blue-500' : 'bg-red-400' },
          ].map((k, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 relative overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-0.5 ${k.top}`} />
              <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">{k.label}</div>
              <div className={`text-2xl font-black ${k.color === 'blue' ? 'text-blue-500' : 'text-red-400'}`}>
                {k.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-center text-gray-400 py-20 animate-pulse text-sm">Cargando...</div>
      ) : metricas.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-16 text-center">
          <div className="text-4xl mb-4">◻</div>
          <div className="text-gray-900 font-bold mb-2">Sin subempresas</div>
          <div className="text-gray-500 text-sm mb-6">Crea la primera subempresa para ver sus métricas aquí</div>
          <button onClick={() => setShowModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm">
            + Crear Subempresa
          </button>
        </div>
      ) : (
        <>
          {/* Tabla de métricas */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-8">
            <div className="px-5 py-4 border-b border-gray-200">
              <div className="text-xs text-gray-500 uppercase tracking-wider">Métricas por Subempresa</div>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  {['Subempresa', 'Empresa', 'Entradas', 'Salidas', 'Flujo Neto', 'Movimientos'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {metricas.map((m, i) => (
                  <tr key={m.id} className={`border-t border-gray-200 hover:bg-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50'}`}>
                    <td className="px-4 py-3 font-semibold text-gray-900">{m.nombre}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-blue-400/10 text-blue-400 px-2 py-0.5 rounded-full">{m.empresa}</span>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-blue-500">{fmt(m.entradas)}</td>
                    <td className="px-4 py-3 text-xs font-mono text-red-400">{fmt(m.salidas)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold font-mono ${m.flujoNeto >= 0 ? 'text-blue-500' : 'text-red-400'}`}>
                        {m.flujoNeto >= 0 ? '+' : ''}{fmt(m.flujoNeto)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 text-center">{m.movimientos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Barras visuales */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-5">Flujo Neto por Subempresa</div>
            <div className="space-y-4">
              {metricas.map(m => {
                const max = Math.max(...metricas.map(x => Math.abs(x.flujoNeto)), 1);
                const pct = Math.abs(m.flujoNeto) / max * 100;
                return (
                  <div key={m.id}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-gray-600 font-medium">{m.nombre}
                        <span className="text-gray-400 ml-2">({m.empresa})</span>
                      </span>
                      <span className={`font-bold font-mono ${m.flujoNeto >= 0 ? 'text-blue-500' : 'text-red-400'}`}>
                        {m.flujoNeto >= 0 ? '+' : ''}{fmt(m.flujoNeto)}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${m.flujoNeto >= 0 ? 'bg-blue-500' : 'bg-red-400'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Modal crear subempresa */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-300 rounded-2xl p-7 w-full max-w-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Nueva Subempresa</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-900 w-8 h-8 bg-gray-100 rounded-lg">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">Empresa *</label>
                <select value={form.empresaId} onChange={e => setForm(p => ({ ...p, empresaId: e.target.value }))}
                  className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 text-sm outline-none focus:border-blue-500">
                  {EMPRESAS.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">Nombre *</label>
                <input value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
                  placeholder="Ej. APE Norte"
                  className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 text-sm outline-none focus:border-blue-500" />
              </div>
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm">Cancelar</button>
              <button onClick={crear} disabled={guardando}
                className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-bold rounded-xl text-sm">
                {guardando ? 'Creando...' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}