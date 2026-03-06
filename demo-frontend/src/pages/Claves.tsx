import { useState, useEffect } from 'react';
import api from '../lib/api';
import { useNotifContext } from '../context/NotifContext';

export default function Claves() {
  const [claves,    setClaves]    = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando,  setEditando]  = useState<any>(null);
  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState({ codigo: '', descripcion: '', categoria: '' });
  const { exito, error } = useNotifContext();

  const cargar = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/claves');
      setClaves(data);
    } catch {
      error('Error al cargar claves');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const abrir = (clave?: any) => {
    if (clave) {
      setEditando(clave);
      setForm({ codigo: clave.codigo, descripcion: clave.descripcion, categoria: clave.categoria || '' });
    } else {
      setEditando(null);
      setForm({ codigo: '', descripcion: '', categoria: '' });
    }
    setShowModal(true);
  };

  const guardar = async () => {
    if (!form.codigo || !form.descripcion) {
      error('Código y descripción son requeridos');
      return;
    }
    setGuardando(true);
    try {
      if (editando) {
        await api.put(`/claves/${editando.id}`, {
          descripcion: form.descripcion,
          categoria:   form.categoria,
        });
        exito('Clave actualizada');
      } else {
        await api.post('/claves', form);
        exito('Clave creada correctamente');
      }
      setShowModal(false);
      cargar();
    } catch (e: any) {
      error(e.response?.data?.error || 'Error al guardar');
    } finally {
      setGuardando(false);
    }
  };

  const toggleActiva = async (clave: any) => {
    try {
      await api.put(`/claves/${clave.id}`, { activa: !clave.activa });
      exito(clave.activa ? 'Clave desactivada' : 'Clave activada');
      cargar();
    } catch {
      error('Error al cambiar estado');
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Claves Contables</h1>
          <p className="text-gray-500 text-sm mt-1">
            {claves.length} claves — Clasificadores de movimientos
          </p>
        </div>
        <button onClick={() => abrir()}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm">
          + Nueva Clave
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-20 animate-pulse text-sm">Cargando...</div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {claves.map(c => (
            <div key={c.id} className={`bg-white border rounded-xl p-5 transition-all ${
              c.activa ? 'border-gray-200 hover:border-gray-300' : 'border-gray-200 opacity-50'
            }`}>
              <div className="flex justify-between items-start mb-3">
                <div className="text-2xl font-black text-gray-900 font-mono">{c.codigo}</div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  c.activa ? 'bg-blue-100 text-blue-500' : 'bg-red-400/10 text-red-400'
                }`}>
                  {c.activa ? 'Activa' : 'Inactiva'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">{c.descripcion}</p>
              {c.categoria && (
                <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded">
                  {c.categoria}
                </span>
              )}
              <div className="flex gap-2 mt-4">
                <button onClick={() => abrir(c)}
                  className="flex-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-600 py-1.5 rounded-lg">
                  Editar
                </button>
                <button onClick={() => toggleActiva(c)}
                  className={`flex-1 text-xs py-1.5 rounded-lg font-medium ${
                    c.activa
                      ? 'bg-red-400/10 hover:bg-red-400/20 text-red-400'
                      : 'bg-blue-100 hover:bg-blue-500/20 text-blue-500'
                  }`}>
                  {c.activa ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-300 rounded-2xl p-7 w-full max-w-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                {editando ? 'Editar Clave' : 'Nueva Clave'}
              </h2>
              <button onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-900 w-8 h-8 bg-gray-100 rounded-lg">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">
                  Código *
                </label>
                <input
                  value={form.codigo}
                  onChange={e => setForm(p => ({ ...p, codigo: e.target.value.toUpperCase() }))}
                  placeholder="Ej. CEBE"
                  disabled={!!editando}
                  className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 text-sm outline-none focus:border-blue-500 disabled:opacity-50 font-mono"
                />
                {editando && (
                  <p className="text-xs text-gray-400 mt-1">El código no se puede cambiar</p>
                )}
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">
                  Descripción *
                </label>
                <input
                  value={form.descripcion}
                  onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
                  placeholder="Ej. Centro de Beneficios"
                  className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">
                  Categoría
                </label>
                <input
                  value={form.categoria}
                  onChange={e => setForm(p => ({ ...p, categoria: e.target.value }))}
                  placeholder="Ej. Operativo, Administrativo..."
                  className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <button onClick={() => setShowModal(false)}
                className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm">
                Cancelar
              </button>
              <button onClick={guardar} disabled={guardando}
                className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-bold rounded-xl text-sm">
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}