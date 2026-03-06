import { useState, useEffect } from 'react';
import api from '../lib/api';

const fmt = (n: number) => '$' + Number(n).toLocaleString('es-MX');

export default function Cajas() {
  const [cajas,     setCajas]     = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [notif,     setNotif]     = useState('');
  const [form, setForm] = useState({
    cajaOrigenId: '', cajaDestinoId: '', monto: '', concepto: ''
  });
  const [guardando, setGuardando] = useState(false);

  const cargar = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/cajas');
      setCajas(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const transferir = async () => {
    if (!form.cajaOrigenId || !form.cajaDestinoId || !form.monto) {
      alert('Completa todos los campos');
      return;
    }
    setGuardando(true);
    try {
      await api.post('/cajas/transferir', {
        cajaOrigenId:  Number(form.cajaOrigenId),
        cajaDestinoId: Number(form.cajaDestinoId),
        monto:         Number(form.monto),
        concepto:      form.concepto || 'Transferencia entre cajas',
      });
      setShowModal(false);
      setForm({ cajaOrigenId: '', cajaDestinoId: '', monto: '', concepto: '' });
      setNotif('Transferencia realizada correctamente');
      setTimeout(() => setNotif(''), 3000);
      cargar();
    } catch (e: any) {
      alert(e.response?.data?.error || 'Error al transferir');
    } finally {
      setGuardando(false);
    }
  };

  // Agrupar por empresa
  const porEmpresa: Record<string, any[]> = {};
  cajas.forEach(c => {
    const e = c.empresa.nombre;
    if (!porEmpresa[e]) porEmpresa[e] = [];
    porEmpresa[e].push(c);
  });

  const saldoTotal = cajas.reduce((a, c) => a + Number(c.saldo), 0);

  return (
    <div className="p-8">
      {notif && (
        <div className="fixed top-5 right-5 z-50 bg-gray-100 border border-blue-500 rounded-xl px-5 py-3 text-sm text-blue-500 font-medium shadow-xl">
          ✓ {notif}
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Cajas y Bóvedas</h1>
          <p className="text-gray-500 text-sm mt-1">Saldo total: <span className="text-blue-500 font-bold">{fmt(saldoTotal)}</span></p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="bg-blue-500 hover:bg-blue-400 text-gray-900 font-bold px-5 py-2.5 rounded-xl text-sm transition-all">
          ⇄ Transferir entre Cajas
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-20 animate-pulse text-sm">Cargando...</div>
      ) : (
        <div className="space-y-8">
          {Object.entries(porEmpresa).map(([empresa, cajasEmpresa]) => {
            const saldoEmpresa = cajasEmpresa.reduce((a, c) => a + Number(c.saldo), 0);
            return (
              <div key={empresa}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-bold bg-blue-400/10 text-blue-400 px-3 py-1 rounded-full uppercase tracking-wider">{empresa}</span>
                  <span className="text-xs text-gray-500">Saldo empresa: <span className="text-gray-900 font-bold">{fmt(saldoEmpresa)}</span></span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {cajasEmpresa.map(caja => {
                    const pct = saldoTotal > 0 ? (Number(caja.saldo) / saldoTotal) * 100 : 0;
                    return (
                      <div key={caja.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-all">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="text-sm font-bold text-gray-900">{caja.nombre}</div>
                            <div className="text-xs text-gray-400 mt-0.5">{caja.locacion}</div>
                          </div>
                          <div className="w-2 h-2 rounded-full bg-blue-500 mt-1" />
                        </div>
                        <div className={`text-2xl font-black font-mono mb-3 ${Number(caja.saldo) > 0 ? 'text-blue-500' : 'text-gray-400'}`}>
                          {fmt(Number(caja.saldo))}
                        </div>
                        {/* Barra de nivel */}
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full transition-all"
                            style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                        <div className="text-xs text-gray-300 mt-1.5">{pct.toFixed(1)}% del total</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal transferencia */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-300 rounded-2xl p-7 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Transferir entre Cajas</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-900 w-8 h-8 bg-gray-100 rounded-lg">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">Caja Origen *</label>
                <select value={form.cajaOrigenId} onChange={e => setForm(p => ({ ...p, cajaOrigenId: e.target.value }))}
                  className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 text-sm outline-none focus:border-blue-400">
                  <option value="">Seleccionar caja</option>
                  {cajas.map(c => <option key={c.id} value={c.id}>{c.nombre} — {fmt(Number(c.saldo))}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">Caja Destino *</label>
                <select value={form.cajaDestinoId} onChange={e => setForm(p => ({ ...p, cajaDestinoId: e.target.value }))}
                  className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 text-sm outline-none focus:border-blue-400">
                  <option value="">Seleccionar caja</option>
                  {cajas.filter(c => c.id !== Number(form.cajaOrigenId)).map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">Monto *</label>
                <input type="number" placeholder="0.00" value={form.monto}
                  onChange={e => setForm(p => ({ ...p, monto: e.target.value }))}
                  className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 text-sm outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">Concepto</label>
                <input placeholder="Motivo de la transferencia" value={form.concepto}
                  onChange={e => setForm(p => ({ ...p, concepto: e.target.value }))}
                  className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 text-sm outline-none focus:border-blue-400" />
              </div>
            </div>

            <div className="flex gap-3 mt-6 justify-end">
              <button onClick={() => setShowModal(false)}
                className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200">
                Cancelar
              </button>
              <button onClick={transferir} disabled={guardando}
                className="px-5 py-2.5 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-gray-900 font-bold rounded-xl text-sm">
                {guardando ? 'Transfiriendo...' : 'Confirmar Transferencia'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}