import { useState, useEffect } from 'react';

export default function WelcomeModal() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Mostrar solo una vez por sesión
    const ya = sessionStorage.getItem('demo-welcome-shown');
    if (!ya) {
      setVisible(true);
      sessionStorage.setItem('demo-welcome-shown', '1');
    }
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white border border-amber-400/50 rounded-2xl p-8 w-full max-w-lg shadow-2xl">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-amber-400/20 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
            🎯
          </div>
          <h2 className="text-2xl font-black text-gray-900">Bienvenido al Demo</h2>
          <p className="text-amber-400 text-sm font-semibold mt-1">CASHFLOW — Vista Previa</p>
        </div>

        {/* Content */}
        <div className="space-y-4 mb-6">
          <div className="bg-gray-100 rounded-xl p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">✅ Lo que puedes hacer</div>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Explorar el dashboard con datos reales de demostración</li>
              <li>• Navegar por movimientos, cajas, socios y proveedores</li>
              <li>• Crear movimientos (se guardan en la sesión demo)</li>
              <li>• Ver tu Cuenta Personal con historial simulado</li>
              <li>• Explorar reportes y auditoría</li>
            </ul>
          </div>

          <div className="bg-gray-100 rounded-xl p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">🔒 Limitaciones del demo</div>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Los datos se reinician periódicamente</li>
              <li>• No se puede crear usuarios adicionales</li>
              <li>• Las descargas de reportes están deshabilitadas</li>
              <li>• Sin autenticación de dos factores (2FA)</li>
            </ul>
          </div>

          <div className="bg-amber-400/10 border border-amber-400/30 rounded-xl p-3 flex items-center gap-3">
            <span className="text-amber-400 text-xl">📧</span>
            <div>
              <div className="text-xs text-amber-400 font-bold uppercase tracking-wider">Credenciales de acceso</div>
              <div className="text-sm text-gray-700 font-mono mt-0.5">
                demo@cashflow.com / demo123
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-2">
          <button
            onClick={() => setVisible(false)}
            className="w-full bg-blue-500 hover:bg-blue-500 text-black font-bold py-3 rounded-xl transition-all text-sm"
          >
            Explorar el Demo →
          </button>
        </div>
      </div>
    </div>
  );
}
