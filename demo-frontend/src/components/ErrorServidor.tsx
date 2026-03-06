interface Props {
  mensaje?: string;
  onReintentar?: () => void;
}

export default function ErrorServidor({ mensaje, onReintentar }: Props) {
  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
      <div className="text-2xl mb-3">⚠</div>
      <div className="text-red-400 font-semibold mb-2">Error de conexión</div>
      <div className="text-slate-400 text-sm mb-4">
        {mensaje || 'No se pudo conectar con el servidor demo.'}
      </div>
      {onReintentar && (
        <button onClick={onReintentar}
          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded-lg transition-all">
          Reintentar
        </button>
      )}
    </div>
  );
}
