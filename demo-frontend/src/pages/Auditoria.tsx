import { useState, useEffect } from 'react';
import api from '../lib/api';

const ACCIONES_COLOR: Record<string, string> = {
  LOGIN:               'bg-blue-400/10 text-blue-400',
  CREAR_MOVIMIENTO:    'bg-blue-100 text-blue-500',
  TRANSFERENCIA_CAJA:  'bg-purple-400/10 text-purple-400',
  CREAR_USUARIO:       'bg-amber-400/10 text-amber-400',
  EDITAR_USUARIO:      'bg-amber-400/10 text-amber-400',
  DESACTIVAR_USUARIO:  'bg-red-400/10 text-red-400',
  ACTIVAR_USUARIO:     'bg-blue-100 text-blue-500',
  CAMBIAR_PASSWORD:    'bg-slate-400/10 text-gray-500',
  CREAR_SUBEMPRESA:    'bg-blue-400/10 text-blue-400',
};

export default function Auditoria() {
  const [registros, setRegistros] = useState<any[]>([]);
  const [total,     setTotal]     = useState(0);
  const [loading,   setLoading]   = useState(true);
  const [pagina,    setPagina]    = useState(1);
  const [filtros,   setFiltros]   = useState({ modulo: '', accion: '' });
  const LIMIT = 50;

  const cargar = async () => {
    setLoading(true);
    try {
      const params: any = {
        page:  pagina,
        limit: LIMIT,
      };
      if (filtros.modulo) params.modulo = filtros.modulo;
      if (filtros.accion) params.accion = filtros.accion;

      const { data } = await api.get('/auditoria', { params });
      setRegistros(data.data);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, [pagina, filtros]);

  const modulos  = ['auth', 'movimientos', 'cajas', 'socios', 'usuarios', 'subempresas'];
  const acciones = Object.keys(ACCIONES_COLOR);
  const paginas  = Math.ceil(total / LIMIT);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Auditoría</h1>
          <p className="text-gray-500 text-sm mt-1">
            {total} registros — Historial permanente e inmodificable
          </p>
        </div>
        <div className="flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 rounded-xl px-4 py-2">
          <span className="text-amber-400 text-xs">⚠</span>
          <span className="text-amber-300 text-xs font-medium">Solo lectura — Ningún registro puede ser eliminado</span>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <select value={filtros.modulo}
          onChange={e => { setFiltros(p => ({ ...p, modulo: e.target.value })); setPagina(1); }}
          className="bg-gray-100 border border-gray-300 text-gray-600 text-xs rounded-lg px-3 py-2 outline-none focus:border-blue-500">
          <option value="">Todos los módulos</option>
          {modulos.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={filtros.accion}
          onChange={e => { setFiltros(p => ({ ...p, accion: e.target.value })); setPagina(1); }}
          className="bg-gray-100 border border-gray-300 text-gray-600 text-xs rounded-lg px-3 py-2 outline-none focus:border-blue-500">
          <option value="">Todas las acciones</option>
          {acciones.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        {(filtros.modulo || filtros.accion) && (
          <button onClick={() => { setFiltros({ modulo: '', accion: '' }); setPagina(1); }}
            className="text-xs text-gray-500 hover:text-gray-900 bg-gray-100 border border-gray-300 px-3 py-2 rounded-lg">
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Tabla */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              {['Fecha y Hora', 'Usuario', 'Acción', 'Módulo', 'IP', 'Detalle'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="text-center text-gray-400 py-12 text-xs animate-pulse">Cargando...</td></tr>
            )}
            {!loading && registros.length === 0 && (
              <tr><td colSpan={6} className="text-center text-gray-400 py-12 text-xs">Sin registros</td></tr>
            )}
            {registros.map((r, i) => (
              <tr key={r.id} className={`border-t border-gray-200 hover:bg-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50'}`}>
                <td className="px-4 py-3 text-xs text-gray-500 font-mono whitespace-nowrap">
                  {new Date(r.creadoEn).toLocaleString('es-MX', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit', second: '2-digit',
                  })}
                </td>
                <td className="px-4 py-3">
                  <div className="text-xs font-semibold text-gray-900">{r.usuario?.nombre || '—'}</div>
                  <div className="text-xs text-gray-400">{r.usuario?.email}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ACCIONES_COLOR[r.accion] || 'bg-gray-200 text-gray-600'}`}>
                    {r.accion}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">{r.modulo}</span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400 font-mono">{r.ip || '—'}</td>
                <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate font-mono">
                  {r.detalle ? JSON.stringify(r.detalle) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {paginas > 1 && (
        <div className="flex items-center justify-between mt-5">
          <span className="text-xs text-gray-500">
            Página {pagina} de {paginas} — {total} registros totales
          </span>
          <div className="flex gap-2">
            <button onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={pagina === 1}
              className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs disabled:opacity-40 hover:bg-gray-200">
              ← Anterior
            </button>
            {Array.from({ length: Math.min(5, paginas) }, (_, i) => {
              const p = pagina <= 3 ? i + 1 : pagina - 2 + i;
              if (p < 1 || p > paginas) return null;
              return (
                <button key={p} onClick={() => setPagina(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs ${p === pagina ? 'bg-blue-500 text-white font-bold' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {p}
                </button>
              );
            })}
            <button onClick={() => setPagina(p => Math.min(paginas, p + 1))} disabled={pagina === paginas}
              className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs disabled:opacity-40 hover:bg-gray-200">
              Siguiente →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}