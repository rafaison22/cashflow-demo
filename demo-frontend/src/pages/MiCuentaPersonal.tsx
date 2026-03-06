import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import api from '../lib/api';

const fmt = (n: number) => '$' + Number(n).toLocaleString('es-MX', { minimumFractionDigits: 2 });

export default function MiCuentaPersonal() {
  const [data,    setData]    = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  useEffect(() => {
    api.get('/mi-cuenta')
      .then(r => setData(r.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-gray-500 text-sm animate-pulse">Cargando tu cuenta...</div>
    </div>
  );

  if (error || !data) return (
    <div className="p-8">
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
        <div className="text-red-400 font-bold mb-2">No se pudo cargar tu cuenta</div>
        <div className="text-gray-500 text-sm">Verifica que el servidor esté corriendo.</div>
      </div>
    </div>
  );

  const { usuario, saldoAcumulado, sueldoMensual, totalRetirado, retiros, evolucionSaldo } = data;
  const pctDisponible = sueldoMensual > 0 ? Math.min((saldoAcumulado / sueldoMensual) * 100, 999) : 0;

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-start gap-6 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-blue-600 flex items-center justify-center text-2xl font-black text-black flex-shrink-0">
          {usuario?.nombre?.[0] || 'D'}
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-gray-900">{usuario?.nombre}</h1>
            <span className="text-xs bg-amber-400/20 text-amber-400 border border-amber-400/30 px-2 py-0.5 rounded-full font-bold">
              DEMO
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-1">{usuario?.email}</p>
          <p className="text-xs text-gray-400 mt-0.5">Rol: <span className="text-blue-500 font-semibold">{usuario?.rol}</span></p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gray-300" />
          <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Sueldo Mensual</div>
          <div className="text-2xl font-black text-gray-900">{fmt(sueldoMensual)}</div>
          <div className="text-xs text-gray-400 mt-1">Se acredita cada mes</div>
        </div>

        <div className="bg-white border border-blue-300 rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500" />
          <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Saldo Disponible</div>
          <div className="text-2xl font-black text-blue-500">{fmt(saldoAcumulado)}</div>
          <div className="text-xs text-gray-400 mt-1">Saldo acumulado (demo)</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-red-400/50" />
          <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Total Retirado</div>
          <div className="text-2xl font-black text-gray-600">{fmt(totalRetirado)}</div>
          <div className="text-xs text-gray-400 mt-1">{retiros.length} retiros registrados</div>
        </div>
      </div>

      {/* Barra de disponibilidad */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs text-gray-500 uppercase tracking-widest">Saldo acumulado vs sueldo mensual</span>
          <span className="text-sm font-bold text-blue-500">{pctDisponible.toFixed(0)}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all"
            style={{ width: `${Math.min(pctDisponible, 100)}%` }}
          />
        </div>
        {pctDisponible > 100 && (
          <div className="text-xs text-amber-400 mt-2">
            ✓ Tienes {fmt(saldoAcumulado - sueldoMensual)} adicional acumulado de períodos anteriores
          </div>
        )}
      </div>

      {/* Gráfica de evolución + Retiros personales */}
      <div className="grid grid-cols-2 gap-6 mb-6">

        {/* Gráfica evolución */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="text-xs text-gray-500 uppercase tracking-widest mb-4">Evolución de Saldo — Últimos 6 Meses</div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={evolucionSaldo}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="mes" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => '$' + (v / 1000).toFixed(0) + 'k'}
              />
              <Tooltip
                formatter={(v: any) => fmt(v)}
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Line
                type="monotone"
                dataKey="saldo"
                stroke="#34d399"
                strokeWidth={2.5}
                dot={{ fill: '#34d399', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Retiros personales */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200">
            <div className="text-xs text-gray-500 uppercase tracking-widest">Historial de Retiros Personales</div>
          </div>
          <div className="overflow-y-auto max-h-52">
            {retiros.length === 0 ? (
              <div className="text-center text-gray-400 py-10 text-sm">Sin retiros registrados</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left px-5 py-3 text-xs text-gray-400 uppercase tracking-wider">Fecha</th>
                    <th className="text-left px-5 py-3 text-xs text-gray-400 uppercase tracking-wider">Concepto</th>
                    <th className="text-right px-5 py-3 text-xs text-gray-400 uppercase tracking-wider">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {retiros.map((r: any) => (
                    <tr key={r.id} className="border-t border-gray-200 hover:bg-gray-50">
                      <td className="px-5 py-3 text-xs text-gray-500 font-mono">
                        {new Date(r.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-600">{r.concepto}</td>
                      <td className="px-5 py-3 text-xs font-bold font-mono text-right text-red-400">
                        -{fmt(Number(r.monto))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>


    </div>
  );
}
