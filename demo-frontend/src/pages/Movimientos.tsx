import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { useNotifContext } from '../context/NotifContext';

const fmt = (n: number | string) => '$' + Number(n).toLocaleString('es-MX', { minimumFractionDigits: 2 });

interface Movimiento {
  id: number;
  fecha: string;
  tipo: 'ENTRADA' | 'SALIDA' | 'TRANSFERENCIA';
  monto: string;
  concepto: string;
  persona: string;
  empresa: { nombre: string };
  caja: { nombre: string };
  clave?: { codigo: string };
}

const LIMIT = 25;

export default function Movimientos() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [total,       setTotal]       = useState(0);
  const [pagina,      setPagina]      = useState(1);
  const [paginas,     setPaginas]     = useState(1);
  const [loading,     setLoading]     = useState(true);
  const [showModal,   setShowModal]   = useState(false);
  const [guardando,   setGuardando]   = useState(false);
  const [empresas,    setEmpresas]    = useState<any[]>([]);
  const [cajas,       setCajas]       = useState<any[]>([]);
  const [claves,      setClaves]      = useState<any[]>([]);
  const [filtros,     setFiltros]     = useState({
    tipo: '', empresaId: '', search: '', desde: '', hasta: ''
  });
  
  const [form, setForm] = useState({
    tipo: 'ENTRADA', monto: '', concepto: '', persona: '',
    empresaId: '', cajaId: '', claveId: '',
    fecha: new Date().toISOString().split('T')[0],
  });

  const { exito, error } = useNotifContext();

  const cargarMovimientos = useCallback(async (pag = 1) => {
    setLoading(true);
    try {
      const params: any = { page: pag, limit: LIMIT };
      if (filtros.tipo)      params.tipo      = filtros.tipo;
      if (filtros.empresaId) params.empresaId = filtros.empresaId;
      if (filtros.search)    params.persona   = filtros.search;
      if (filtros.desde)     params.desde     = filtros.desde;
      if (filtros.hasta)     params.hasta     = filtros.hasta;

      const { data } = await api.get('/movimientos', { params });
      setMovimientos(data.data);
      setTotal(data.total);
      setPaginas(data.paginas || 1);
    } catch {
      error('No se pudieron cargar los movimientos');
    } finally {
      setLoading(false);
    }
  }, [filtros, error]);

  const cargarCatalogos = useCallback(async () => {
    try {
      // 1. Cargar Cajas y Empresas
      const resCajas = await api.get('/cajas');
      const cajasData = resCajas.data;
      setCajas(cajasData);

      const empresasMap = new Map();
      cajasData.forEach((c: any) => {
        if (c.empresa && !empresasMap.has(c.empresaId)) {
          empresasMap.set(c.empresaId, { id: c.empresaId, nombre: c.empresa.nombre });
        }
      });
      setEmpresas(Array.from(empresasMap.values()));

      // 2. Cargar Claves Reales y filtrar activas
      const resClaves = await api.get('/claves');
      const activas = resClaves.data.filter((c: any) => c.activa === true);
      setClaves(activas);

      // Valores por defecto para el form
      if (cajasData.length > 0) {
        setForm(prev => ({
          ...prev,
          empresaId: prev.empresaId || cajasData[0].empresaId.toString(),
          cajaId:    prev.cajaId    || cajasData[0].id.toString(),
        }));
      }
    } catch {
      console.error('Error cargando catálogos');
    }
  }, []);

  useEffect(() => { cargarCatalogos(); }, [cargarCatalogos]);

  useEffect(() => {
    setPagina(1);
    cargarMovimientos(1);
  }, [filtros, cargarMovimientos]);

  useEffect(() => {
    cargarMovimientos(pagina);
  }, [pagina, cargarMovimientos]);

  const guardar = async () => {
    if (!form.monto || !form.concepto || !form.persona || !form.empresaId || !form.cajaId) {
      error('Completa todos los campos obligatorios');
      return;
    }
    setGuardando(true);
    try {
      await api.post('/movimientos', {
        ...form,
        monto:     Number(form.monto),
        empresaId: Number(form.empresaId),
        cajaId:    Number(form.cajaId),
        claveId:   form.claveId ? Number(form.claveId) : null,
      });
      exito('Movimiento registrado con éxito');
      setShowModal(false);
      setForm(prev => ({
        ...prev, monto: '', concepto: '', persona: '',
        fecha: new Date().toISOString().split('T')[0],
      }));
      cargarMovimientos(1);
    } catch (e: any) {
      error(e.response?.data?.error || 'Error al guardar movimiento');
    } finally {
      setGuardando(false);
    }
  };

  const limpiarFiltros = () => setFiltros({ tipo: '', empresaId: '', search: '', desde: '', hasta: '' });
  const hayFiltros = Object.values(filtros).some(v => v !== '');

  return (
    <div className="p-8 min-h-screen bg-gray-50 text-gray-800">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Movimientos</h1>
          <p className="text-gray-400 text-sm mt-1">{total} registros totales</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="bg-blue-500 hover:bg-blue-500 text-gray-900 font-bold px-6 py-3 rounded-xl text-sm shadow-lg shadow-blue-500/20">
          + Nuevo Movimiento
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6">
        <div className="grid grid-cols-5 gap-3 mb-3">
          <div className="col-span-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Buscar</label>
            <input
              value={filtros.search}
              onChange={e => setFiltros(p => ({ ...p, search: e.target.value }))}
              placeholder="Persona, concepto..."
              className="w-full bg-gray-100 border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 text-gray-900"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Tipo</label>
            <select value={filtros.tipo}
              onChange={e => setFiltros(p => ({ ...p, tipo: e.target.value }))}
              className="w-full bg-gray-100 border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 text-gray-900">
              <option value="">Todos</option>
              <option value="ENTRADA">Entradas</option>
              <option value="SALIDA">Salidas</option>
              <option value="TRANSFERENCIA">Transferencias</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Empresa</label>
            <select value={filtros.empresaId}
              onChange={e => setFiltros(p => ({ ...p, empresaId: e.target.value }))}
              className="w-full bg-gray-100 border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 text-gray-900">
              <option value="">Todas</option>
              {empresas.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            {hayFiltros && (
              <button onClick={limpiarFiltros}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-600 text-sm px-3 py-2.5 rounded-xl">
                ✕ Limpiar
              </button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input type="date" value={filtros.desde} onChange={e => setFiltros(p => ({ ...p, desde: e.target.value }))} className="bg-gray-100 border border-gray-300 rounded-xl px-4 py-2 text-sm text-gray-900" />
          <input type="date" value={filtros.hasta} onChange={e => setFiltros(p => ({ ...p, hasta: e.target.value }))} className="bg-gray-100 border border-gray-300 rounded-xl px-4 py-2 text-sm text-gray-900" />
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden mb-4">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="bg-gray-900/80 border-b border-gray-200">
              {['Fecha','Tipo','Persona / Concepto','Clave','Empresa / Caja','Monto'].map(h => (
                <th key={h} className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-20 text-gray-400 animate-pulse">Cargando...</td></tr>
            ) : movimientos.map(m => (
              <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-xs font-mono text-gray-400">{new Date(m.fecha).toLocaleDateString('es-MX')}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${m.tipo === 'ENTRADA' ? 'text-blue-500 bg-blue-100' : m.tipo === 'SALIDA' ? 'text-rose-400 bg-rose-400/10' : 'text-sky-400 bg-sky-400/10'}`}>
                    {m.tipo}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold">{m.persona}</div>
                  <div className="text-[11px] text-gray-400 truncate max-w-xs">{m.concepto}</div>
                </td>
                <td className="px-6 py-4 text-xs">
                  {m.clave ? <span className="bg-gray-100 px-2 py-1 rounded text-gray-500">{m.clave.codigo}</span> : '—'}
                </td>
                <td className="px-6 py-4 text-[11px]">
                  <div className="text-blue-400">{m.empresa?.nombre}</div>
                  <div className="text-gray-400">{m.caja?.nombre}</div>
                </td>
                <td className={`px-6 py-4 text-right font-mono font-bold ${m.tipo === 'ENTRADA' ? 'text-blue-500' : 'text-rose-400'}`}>
                  {m.tipo === 'ENTRADA' ? '+' : '-'}{fmt(m.monto)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md flex items-center justify-center z-50 p-6">
          <div className="bg-white border border-gray-200 rounded-3xl p-8 w-full max-w-xl shadow-2xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Nuevo Movimiento</h2>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Tipo *</label>
                <select value={form.tipo}
                  onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))}
                  className="w-full bg-gray-100 border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900">
                  <option value="ENTRADA">Entrada</option>
                  <option value="SALIDA">Salida</option>
                  <option value="TRANSFERENCIA">Transferencia</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Monto *</label>
                <input type="number" value={form.monto} onChange={e => setForm(p => ({ ...p, monto: e.target.value }))} placeholder="0.00" className="w-full bg-gray-100 border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Empresa *</label>
                <select value={form.empresaId} onChange={e => setForm(p => ({ ...p, empresaId: e.target.value, cajaId: '' }))} className="w-full bg-gray-100 border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900">
                  <option value="">Seleccionar...</option>
                  {empresas.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Caja *</label>
                <select value={form.cajaId} onChange={e => setForm(p => ({ ...p, cajaId: e.target.value }))} className="w-full bg-gray-100 border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900">
                  <option value="">Seleccionar...</option>
                  {cajas.filter((c: any) => !form.empresaId || c.empresaId === Number(form.empresaId)).map((c: any) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Clave</label>
                <select value={form.claveId} onChange={e => setForm(p => ({ ...p, claveId: e.target.value }))} className="w-full bg-gray-100 border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900">
                  <option value="">Sin clave</option>
                  {claves.map(c => <option key={c.id} value={c.id}>{c.codigo} - {c.descripcion}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Fecha</label>
                <input type="date" value={form.fecha} onChange={e => setForm(p => ({ ...p, fecha: e.target.value }))} className="w-full bg-gray-100 border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900" />
              </div>
              <div className="col-span-2">
                <input value={form.persona} onChange={e => setForm(p => ({ ...p, persona: e.target.value }))} placeholder="Persona *" className="w-full bg-gray-100 border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900" />
              </div>
              <div className="col-span-2">
                <textarea value={form.concepto} onChange={e => setForm(p => ({ ...p, concepto: e.target.value }))} placeholder="Concepto *" className="w-full bg-gray-100 border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 h-20" />
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button onClick={() => setShowModal(false)} className="flex-1 px-6 py-3 bg-gray-100 text-gray-500 rounded-xl">Cancelar</button>
              <button onClick={guardar} disabled={guardando} className="flex-1 px-6 py-3 bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20">
                {guardando ? 'Guardando...' : 'Registrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}