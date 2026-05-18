import { useState } from 'react';
import type { ResultadoCalculo } from '../types';
import { convertirDensidad } from '../engines/motor_densidad';
import ResultadoPanel from './ResultadoPanel';
import AdvertenciaPanel from './AdvertenciaPanel';

export default function CalculadoraDensidad() {
  const [valor, setValor] = useState('');
  const [unidadOrigen, setUnidadOrigen] = useState<'L' | 'kg'>('L');
  const [densidad, setDensidad] = useState('');
  const [resultado, setResultado] = useState<ResultadoCalculo | null>(null);
  const [errores, setErrores] = useState<string[]>([]);

  function calcular() {
    setErrores([]);
    setResultado(null);
    const v = parseFloat(valor.replace(',', '.'));
    const d = parseFloat(densidad.replace(',', '.'));
    try {
      const res = convertirDensidad(isNaN(v) ? null : v, unidadOrigen, isNaN(d) ? null : d);
      setResultado(res);
    } catch (e) {
      setErrores([(e as Error).message]);
    }
  }

  function limpiar() {
    setValor('');
    setDensidad('');
    setResultado(null);
    setErrores([]);
  }

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
        <strong>Importante:</strong> No es posible convertir litros a kilos sin conocer la densidad del producto.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
          <input
            type="number"
            value={valor}
            onChange={e => { setValor(e.target.value); setResultado(null); }}
            placeholder="Ej: 5"
            className="w-full h-12 px-3 rounded-lg border border-gray-300 text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Convertir de</label>
          <select
            value={unidadOrigen}
            onChange={e => { setUnidadOrigen(e.target.value as 'L' | 'kg'); setResultado(null); }}
            className="w-full h-12 px-3 rounded-lg border border-gray-300 text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="L">L → kg</option>
            <option value="kg">kg → L</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Densidad (kg/L)</label>
          <input
            type="number"
            value={densidad}
            onChange={e => { setDensidad(e.target.value); setResultado(null); }}
            placeholder="Ej: 1,25"
            step="0.01"
            className="w-full h-12 px-3 rounded-lg border border-gray-300 text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-500">
        <strong>Densidades típicas:</strong> Agua: 1,0 · Fertilizante líquido: 1,2–1,5 · Aminoácidos: 1,1–1,3 · Aceites: 0,85–0,95
      </div>

      <div className="flex gap-3">
        <button onClick={calcular} className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg text-lg transition-colors">
          Calcular
        </button>
        <button onClick={limpiar} className="h-12 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors">
          Limpiar
        </button>
      </div>

      {errores.length > 0 && <AdvertenciaPanel mensajes={errores} tipo="error" />}
      {resultado && <ResultadoPanel resultado={resultado} />}
    </div>
  );
}
