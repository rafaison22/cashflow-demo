import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../lib/api';
import ErrorServidor from '../components/ErrorServidor';

const fmt = (n: number) => '$' + Number(n).toLocaleString('es-MX', { minimumFractionDigits: 0 });

export default function Dashboard() {
  const [resumen,     setResumen]     = useState<any>(null);
  const [metricas,    setMetricas]    = useState<any[]>([]);
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [errorCarga,  setErrorCarga]  = useState(false);

  useEffect(() => {
    setErrorCarga(false);
    Promise.all([
      api.get('/movimientos/resumen'),
      api.get('/subempresas/metricas'),
      api.get('/proveedores'),
    ]).then(([r, m, p]) => {
      setResumen(r.data);
      setMetricas(m.data);
      setProveedores(p.data);
    }).catch(() => {
      setErrorCarga(true);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-full min-h-64">
      <div className="text-gray-500 text-sm animate-pulse">Cargando dashboard demo...</div>
    </div>
  );

  if (errorCarga) return (
    <div className="p-8">
      <h1 className="text-2xl font-black text-gray-900 mb-4">Dashboard</h1>
      <ErrorServidor
        mensaje="No se pudo cargar el dashboard demo. Verifica que el backend esté corriendo en puerto 3001."
        onReintentar={() => window.location.reload()}
      />
    </div>
  );

  const empresas = ['Empresa Demo A', 'Empresa Demo B'];
  const saldoPorEmpresa = empresas.map(e => ({
    empresa: e === 'Empresa Demo A' ? 'Demo A' : 'Demo B',
    saldo: resumen?.cajas?.filter((c: any) => c.empresa.nombre === e)
      .reduce((a: number, c: any) => a + Number(c.saldo), 0) || 0
  }));

  const totalPendienteProveedores = proveedores.reduce((acc: number, p: any) =>
    acc + p.transferencias.reduce((a: number, t: any) => a + Number(t.pendiente), 0), 0
  );

  const topSubempresas = [...metricas].sort((a, b) => b.flujoNeto - a.flujoNeto).slice(0, 5);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          <span className="ml-3 text-xs bg-amber-400/20 text-amber-400 px-2 py-0.5 rounded-full font-bold">DEMO</span>
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Saldo Total Global',    value: fmt(resumen?.saldoTotal || 0),     top: 'bg-blue-500' },
          { label: 'Entradas del Mes',       value: fmt(resumen?.mes?.entradas || 0),  top: 'bg-blue-500' },
          { label: 'Salidas del Mes',        value: fmt(resumen?.mes?.salidas || 0),   top: 'bg-red-400' },
          { label: 'Por Cobrar Proveedores', value: fmt(totalPendienteProveedores),     top: 'bg-amber-400' },
        ].map((k, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 relative overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-0.5 ${k.top}`} />
            <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">{k.label}</div>
            <div className="text-2xl font-black text-gray-900">{k.value}</div>
          </div>
        ))}
      </div>

      {/* Fila 2 */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="col-span-2 bg-white border border-gray-200 rounded-xl p-5">
          <div className="text-xs text-gray-500 uppercase tracking-widest mb-4">Saldo por Empresa</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={saldoPorEmpresa}>
              <XAxis dataKey="empresa" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={v => '$' + (v / 1000).toFixed(0) + 'k'} />
              <Tooltip formatter={(v: any) => fmt(v)}
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
              <Bar dataKey="saldo" fill="#4199bb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="text-xs text-gray-500 uppercase tracking-widest mb-4">Cajas</div>
          <div className="space-y-2.5 overflow-y-auto max-h-44">
            {resumen?.cajas?.map((c: any) => (
              <div key={c.id} className="flex justify-between items-center">
                <div>
                  <div className="text-xs font-medium text-gray-800 leading-tight">{c.nombre}</div>
                  <div className="text-xs text-gray-400">{c.empresa.nombre}</div>
                </div>
                <div className={`text-xs font-bold font-mono ${Number(c.saldo) > 0 ? 'text-blue-500' : 'text-gray-400'}`}>
                  {fmt(Number(c.saldo))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fila 3 */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="text-xs text-gray-500 uppercase tracking-widest mb-4">Top Subempresas por Flujo Neto</div>
          {topSubempresas.length === 0 ? (
            <div className="text-center text-gray-400 py-8 text-xs">Sin subempresas registradas</div>
          ) : (
            <div className="space-y-3">
              {topSubempresas.map((s, i) => {
                const max = Math.max(...topSubempresas.map(x => Math.abs(x.flujoNeto)), 1);
                const pct = Math.abs(s.flujoNeto) / max * 100;
                return (
                  <div key={s.id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">
                        <span className="text-gray-400 mr-2">#{i + 1}</span>
                        {s.nombre}
                      </span>
                      <span className={`font-bold font-mono ${s.flujoNeto >= 0 ? 'text-blue-500' : 'text-red-400'}`}>
                        {s.flujoNeto >= 0 ? '+' : ''}{fmt(s.flujoNeto)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${s.flujoNeto >= 0 ? 'bg-blue-500' : 'bg-red-400'}`}
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="text-xs text-gray-500 uppercase tracking-widest mb-4">Estado de Proveedores</div>
          {proveedores.length === 0 ? (
            <div className="text-center text-gray-400 py-8 text-xs">Sin proveedores registrados</div>
          ) : (
            <div className="space-y-3">
              {proveedores.map((p: any) => {
                const pendiente = p.transferencias.reduce((a: number, t: any) => a + Number(t.pendiente), 0);
                const enviado   = p.transferencias.reduce((a: number, t: any) => a + Number(t.montoEnviado), 0);
                const recibido  = p.transferencias.reduce((a: number, t: any) => a + Number(t.montoRecibido), 0);
                const pct       = enviado > 0 ? (recibido / enviado) * 100 : 100;
                return (
                  <div key={p.id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600 font-medium">{p.nombre}</span>
                      <span className={`font-bold font-mono ${pendiente > 0 ? 'text-amber-400' : 'text-blue-500'}`}>
                        {pendiente > 0 ? `${fmt(pendiente)} pendiente` : '✓ Al corriente'}
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${pendiente > 0 ? 'bg-amber-400' : 'bg-blue-500'}`}
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Últimos movimientos */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="text-xs text-gray-500 uppercase tracking-widest mb-4">Movimientos Recientes</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              {['Fecha', 'Tipo', 'Persona', 'Concepto', 'Empresa', 'Caja', 'Monto'].map(h => (
                <th key={h} className="pb-3 text-xs text-gray-400 uppercase tracking-wider font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {resumen?.ultimosMovimientos?.length === 0 && (
              <tr><td colSpan={7} className="text-center text-gray-400 py-8 text-xs">Sin movimientos aún</td></tr>
            )}
            {resumen?.ultimosMovimientos?.map((m: any) => (
              <tr key={m.id} className="border-t border-gray-200 hover:bg-gray-50">
                <td className="py-3 text-xs text-gray-500 font-mono">
                  {new Date(m.fecha).toLocaleDateString('es-MX')}
                </td>
                <td className="py-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    m.tipo === 'ENTRADA' ? 'bg-blue-100 text-blue-500' :
                    m.tipo === 'SALIDA'  ? 'bg-red-400/10 text-red-400' :
                    'bg-blue-400/10 text-blue-400'}`}>
                    {m.tipo === 'ENTRADA' ? '↑' : m.tipo === 'SALIDA' ? '↓' : '⇄'} {m.tipo}
                  </span>
                </td>
                <td className="py-3 text-xs text-gray-600">{m.persona}</td>
                <td className="py-3 text-xs text-gray-500 max-w-32 truncate">{m.concepto}</td>
                <td className="py-3">
                  <span className="text-xs bg-blue-400/10 text-blue-400 px-2 py-0.5 rounded-full">
                    {m.empresa?.nombre}
                  </span>
                </td>
                <td className="py-3 text-xs text-gray-500">{m.caja?.nombre}</td>
                <td className={`py-3 text-xs font-bold font-mono ${
                  m.tipo === 'ENTRADA' ? 'text-blue-500' :
                  m.tipo === 'SALIDA'  ? 'text-red-400' : 'text-blue-400'}`}>
                  {m.tipo === 'SALIDA' ? '-' : '+'}{fmt(Number(m.monto))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
