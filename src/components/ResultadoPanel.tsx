import type { ResultadoCalculo } from '../types';
import AdvertenciaPanel from './AdvertenciaPanel';

interface Props {
  resultado: ResultadoCalculo;
}

function formatValor(n: number): string {
  const rounded = parseFloat(n.toPrecision(10));
  if (Number.isInteger(rounded)) return rounded.toLocaleString('es-ES');
  return rounded.toLocaleString('es-ES', { maximumFractionDigits: 6 });
}

export default function ResultadoPanel({ resultado }: Props) {
  return (
    <div className="mt-6 space-y-4">
      {/* Resultado principal */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
        <p className="text-sm font-medium text-green-600 uppercase tracking-wide mb-1">Resultado</p>
        <p className="text-5xl font-bold text-green-700 leading-tight">
          {formatValor(resultado.valor)}
        </p>
        <p className="text-2xl font-semibold text-green-600 mt-1">{resultado.unidad}</p>
      </div>

      {/* Fórmula */}
      <div className="bg-lime-50 border border-lime-200 rounded-lg p-4">
        <p className="text-xs font-semibold text-lime-700 uppercase tracking-wide mb-2">Fórmula aplicada</p>
        <p className="font-mono text-sm text-lime-900 break-all">{resultado.formula}</p>
      </div>

      {/* Pasos */}
      {resultado.pasos.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Paso a paso</p>
          <ol className="space-y-2">
            {resultado.pasos.map((paso, i) => (
              <li key={i} className="flex gap-3 text-sm text-gray-700">
                <span className="flex-shrink-0 w-5 h-5 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </span>
                <span>{paso}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Advertencias no bloqueantes */}
      {resultado.advertencias.length > 0 && (
        <AdvertenciaPanel mensajes={resultado.advertencias} tipo="advertencia" />
      )}
    </div>
  );
}
