import clsx from 'clsx';

interface Props {
  mensajes: string[];
  tipo?: 'error' | 'advertencia' | 'info';
}

export default function AdvertenciaPanel({ mensajes, tipo = 'error' }: Props) {
  if (mensajes.length === 0) return null;

  const estilos = {
    error: 'bg-red-50 border-red-300 text-red-800',
    advertencia: 'bg-amber-50 border-amber-300 text-amber-800',
    info: 'bg-blue-50 border-blue-300 text-blue-800',
  };

  const iconos = {
    error: '✗',
    advertencia: '⚠',
    info: 'ℹ',
  };

  return (
    <div className={clsx('border rounded-lg p-4 mt-4', estilos[tipo])}>
      <div className="flex items-start gap-2">
        <span className="text-lg font-bold shrink-0">{iconos[tipo]}</span>
        <ul className="space-y-1">
          {mensajes.map((msg, i) => (
            <li key={i} className="text-sm font-medium">{msg}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
