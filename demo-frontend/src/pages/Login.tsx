import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../lib/auth';

export default function Login() {
  const [email,    setEmail]    = useState('demo@cashflow.com');
  const [password, setPassword] = useState('demo123');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch {
      setError('Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">

      {/* Banner demo */}
      <div className="fixed top-0 left-0 right-0 bg-amber-500 text-black text-xs font-bold text-center py-1.5 z-50 tracking-widest uppercase">
        ⚡ MODO DEMOSTRACIÓN — Datos ficticios para exploración
      </div>

      <div className="w-full max-w-md mt-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            CASH<span className="text-blue-500">FLOW</span>
          </h1>
          <div className="inline-block mt-2 bg-amber-400/20 border border-amber-400/40 rounded-full px-4 py-1">
            <p className="text-amber-400 text-xs font-bold tracking-widest uppercase">Vista Previa Demo</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-gray-900 font-bold text-xl mb-2">Acceso Demo</h2>
          <p className="text-gray-500 text-sm mb-6">Las credenciales están prellenadas para ti.</p>

          {/* Credenciales visibles */}
          <div className="bg-amber-400/10 border border-amber-400/30 rounded-xl p-4 mb-6 flex items-center gap-3">
            <div className="text-2xl">🔑</div>
            <div>
              <div className="text-xs text-amber-400 font-bold uppercase tracking-wider mb-1">Credenciales Demo</div>
              <div className="text-sm font-mono text-gray-800">demo@cashflow.com</div>
              <div className="text-sm font-mono text-gray-800">demo123</div>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-gray-500 text-xs uppercase tracking-wider block mb-2">
                Correo electrónico
              </label>
              <input type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm focus:outline-none focus:border-blue-500"
                required />
            </div>
            <div>
              <label className="text-gray-500 text-xs uppercase tracking-wider block mb-2">
                Contraseña
              </label>
              <input type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm focus:outline-none focus:border-blue-500"
                required />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-all">
              {loading ? 'Entrando...' : 'Explorar Demo →'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
