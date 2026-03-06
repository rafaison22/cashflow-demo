import { useState, useEffect } from 'react';
import api from '../lib/api';

const fmt = (n: number) => '$' + Number(n).toLocaleString('es-MX');

export default function Proveedores() {
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [showNew,     setShowNew]     = useState(false);
  const [showTransf,  setShowTransf]  = useState(false);
  const [showEfectivo, setShowEfectivo] = useState(false);
  const [notif,       setNotif]       = useState('');
  const [cajas,       setCajas]       = useState<any[]>([]);
  const [formProv,    setFormProv]    = useState({ nombre: '' });
  const [formTransf,  setFormTransf]  = useState({ proveedorId: '', montoEnviado: '' });
  const [formEfect,   setFormEfect]   = useState({ transferenciaId: '', montoRecibido: '', cajaId: '1', empresaId: '1' });
  const [guardando,   setGuardando]   = useState(false);

  const notificar = (msg: string) => { setNotif(msg); setTimeout(() => setNotif(''), 3000); };

  const cargar = async () => {
    setLoading(true);
    try {
      const [provRes, cajaRes] = await Promise.all([
        api.get('/proveedores'),
        api.get('/cajas'),
      ]);
      setProveedores(provRes.data);
      setCajas(cajaRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const crearProveedor = async () => {
    if (!formProv.nombre) return alert('Completa todos los campos');
    setGuardando(true);
    try {
      await api.post('/proveedores', { nombre: formProv.nombre });
      setShowNew(false);
      setFormProv({ nombre: '' });
      notificar('Proveedor creado correctamente');
      cargar();
    } catch (e: any) {
      alert(e.response?.data?.error || 'Error');
    } finally { setGuardando(false); }
  };

  const registrarTransferencia = async () => {
    if (!formTransf.proveedorId || !formTransf.montoEnviado) return alert('Completa todos los campos');
    setGuardando(true);
    try {
      await api.post('/proveedores/transferencia', {
        proveedorId:  Number(formTransf.proveedorId),
        montoEnviado: Number(formTransf.montoEnviado),
      });
      setShowTransf(false);
      setFormTransf({ proveedorId: '', montoEnviado: '' });
      notificar('Transferencia registrada');
      cargar();
    } catch (e: any) {
      alert(e.response?.data?.error || 'Error');
    } finally { setGuardando(false); }
  };

  const registrarEfectivo = async () => {
    if (!formEfect.transferenciaId || !formEfect.montoRecibido) return alert('Completa todos los campos');
    setGuardando(true);
    try {
      await api.post('/proveedores/efectivo-recibido', {
        transferenciaId: Number(formEfect.transferenciaId),
        montoRecibido:   Number(formEfect.montoRecibido),
        cajaId:          Number(formEfect.cajaId),
        empresaId:       Number(formEfect.empresaId),
      });
      setShowEfectivo(false);
      notificar('Efectivo registrado correctamente');
      cargar();
    } catch (e: any) {
      alert(e.response?.data?.error || 'Error');
    } finally { setGuardando(false); }
  };

  // Todas las transferencias pendientes
  const pendientes = proveedores.flatMap(p =>
    p.transferencias.filter((t: any) => !t.liquidado).map((t: any) => ({ ...t, proveedor: p.nombre }))
  );

  return (
    <div className="p-8">
      {notif && (
        <div className="fixed top-5 right-5 z-50 bg-gray-100 border border-blue-500 rounded-xl px-5 py-3 text-sm text-blue-500 font-medium shadow-xl">
          ✓ {notif}
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Proveedores</h1>
          <p className="text-gray-500 text-sm mt-1">{pendientes.length} transferencias pendientes de cobro</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowNew(true)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold px-4 py-2.5 rounded-xl text-sm">
            + Proveedor
          </button>
          <button onClick={() => setShowTransf(true)}
            className="bg-blue-500 hover:bg-blue-400 text-gray-900 font-bold px-4 py-2.5 rounded-xl text-sm">
            Registrar Transferencia
          </button>
          <button onClick={() => setShowEfectivo(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-2.5 rounded-xl text-sm">
            Registrar Efectivo Recibido
          </button>
        </div>
      </div>

      {/* Pendientes */}
      {pendientes.length > 0 && (
        <div className="mb-8">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">Pendientes de Cobro</div>
          <div className="grid grid-cols-3 gap-4">
            {pendientes.map((t: any) => (
              <div key={t.id} className="bg-white border border-amber-400/30 rounded-xl p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-bold text-gray-900">{t.proveedor}</span>
                  <span className="text-xs bg-amber-400/10 text-amber-400 px-2 py-0.5 rounded-full">Pendiente</span>
                </div>
                <div className="text-xs text-gray-500 mb-1">Enviado: <span className="text-gray-900">{fmt(Number(t.montoEnviado))}</span></div>
                <div className="text-xs text-gray-500 mb-1">Esperado: <span className="text-gray-900">{fmt(Number(t.montoEsperado))}</span></div>

                <div className="text-lg font-black text-amber-400">Por cobrar: {fmt(Number(t.pendiente))}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista proveedores */}
      {loading ? (
        <div className="text-center text-gray-400 py-20 animate-pulse text-sm">Cargando...</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {['Proveedor','Total Transferido','Total Recibido','Pendiente','Transferencias'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {proveedores.length === 0 && (
                <tr><td colSpan={5} className="text-center text-gray-400 py-12 text-xs">Sin proveedores aún</td></tr>
              )}
              {proveedores.map((p, i) => {
                const totalEnviado  = p.transferencias.reduce((a: number, t: any) => a + Number(t.montoEnviado), 0);
                const totalRecibido = p.transferencias.reduce((a: number, t: any) => a + Number(t.montoRecibido), 0);
                const totalPendiente = p.transferencias.reduce((a: number, t: any) => a + Number(t.pendiente), 0);
                return (
                  <tr key={p.id} className={`border-t border-gray-200 hover:bg-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50'}`}>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900">{p.nombre}</td>
                    <td className="px-4 py-3 text-xs font-mono text-gray-600">{fmt(totalEnviado)}</td>
                    <td className="px-4 py-3 text-xs font-mono text-blue-500">{fmt(totalRecibido)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold font-mono ${totalPendiente > 0 ? 'text-amber-400' : 'text-gray-400'}`}>
                        {fmt(totalPendiente)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{p.transferencias.length}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal nuevo proveedor */}
      {showNew && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-300 rounded-2xl p-7 w-full max-w-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Nuevo Proveedor</h2>
              <button onClick={() => setShowNew(false)} className="text-gray-400 hover:text-gray-900 w-8 h-8 bg-gray-100 rounded-lg">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">Nombre *</label>
                <input placeholder="Nombre del proveedor" value={formProv.nombre}
                  onChange={e => setFormProv(p => ({ ...p, nombre: e.target.value }))}
                  className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 text-sm outline-none focus:border-blue-500" />
              </div>
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <button onClick={() => setShowNew(false)} className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm">Cancelar</button>
              <button onClick={crearProveedor} disabled={guardando}
                className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-bold rounded-xl text-sm">
                {guardando ? 'Guardando...' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal registrar transferencia */}
      {showTransf && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-300 rounded-2xl p-7 w-full max-w-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Registrar Transferencia</h2>
              <button onClick={() => setShowTransf(false)} className="text-gray-400 hover:text-gray-900 w-8 h-8 bg-gray-100 rounded-lg">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">Proveedor *</label>
                <select value={formTransf.proveedorId} onChange={e => setFormTransf(p => ({ ...p, proveedorId: e.target.value }))}
                  className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 text-sm outline-none focus:border-blue-400">
                  <option value="">Seleccionar</option>
                  {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">Monto Enviado *</label>
                <input type="number" placeholder="0.00" value={formTransf.montoEnviado}
                  onChange={e => setFormTransf(p => ({ ...p, montoEnviado: e.target.value }))}
                  className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 text-sm outline-none focus:border-blue-400" />
              </div>
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <button onClick={() => setShowTransf(false)} className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm">Cancelar</button>
              <button onClick={registrarTransferencia} disabled={guardando}
                className="px-5 py-2.5 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-gray-900 font-bold rounded-xl text-sm">
                {guardando ? 'Guardando...' : 'Registrar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal efectivo recibido */}
      {showEfectivo && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-300 rounded-2xl p-7 w-full max-w-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Registrar Efectivo Recibido</h2>
              <button onClick={() => setShowEfectivo(false)} className="text-gray-400 hover:text-gray-900 w-8 h-8 bg-gray-100 rounded-lg">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">Transferencia Pendiente *</label>
                <select value={formEfect.transferenciaId} onChange={e => setFormEfect(p => ({ ...p, transferenciaId: e.target.value }))}
                  className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 text-sm outline-none focus:border-blue-500">
                  <option value="">Seleccionar</option>
                  {pendientes.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.proveedor} — Por cobrar: {fmt(Number(t.pendiente))}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">Monto Recibido *</label>
                <input type="number" placeholder="0.00" value={formEfect.montoRecibido}
                  onChange={e => setFormEfect(p => ({ ...p, montoRecibido: e.target.value }))}
                  className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 text-sm outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">Caja que recibe *</label>
                <select value={formEfect.cajaId} onChange={e => setFormEfect(p => ({ ...p, cajaId: e.target.value }))}
                  className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 text-sm outline-none focus:border-blue-500">
                  {cajas.map((c: any) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <button onClick={() => setShowEfectivo(false)} className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm">Cancelar</button>
              <button onClick={registrarEfectivo} disabled={guardando}
                className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-bold rounded-xl text-sm">
                {guardando ? 'Guardando...' : 'Registrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}