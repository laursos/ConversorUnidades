import { useState } from 'react';
import type { ResultadoCalculo } from '../types';
import { POOL_DOSIS_HA } from '../constants/units';
import { calcularSuperficie } from '../engines/motor_superficie';
import ResultadoPanel from './ResultadoPanel';
import AdvertenciaPanel from './AdvertenciaPanel';

export default function CalculadoraSuperficie() {
  const [dosis, setDosis] = useState('');
  const [unidadDosis, setUnidadDosis] = useState('L/ha');
  const [superficie, setSuperficie] = useState('');
  const [resultado, setResultado] = useState<ResultadoCalculo | null>(null);
  const [errores, setErrores] = useState<string[]>([]);

  function calcular() {
    setErrores([]);
    setResultado(null);
    const d = parseFloat(dosis.replace(',', '.'));
    const s = parseFloat(superficie.replace(',', '.'));
    try {
      const res = calcularSuperficie(isNaN(d) ? null : d, unidadDosis, isNaN(s) ? null : s);
      setResultado(res);
    } catch (e) {
      setErrores([(e as Error).message]);
    }
  }

  function limpiar() {
    setDosis('');
    setSuperficie('');
    setResultado(null);
    setErrores([]);
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
        Calcula el producto total necesario para tratar toda la superficie de la explotación.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dosis</label>
          <input
            type="number"
            value={dosis}
            onChange={e => { setDosis(e.target.value); setResultado(null); }}
            placeholder="Ej: 3"
            className="w-full h-12 px-3 rounded-lg border border-gray-300 text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Unidad dosis</label>
          <select
            value={unidadDosis}
            onChange={e => { setUnidadDosis(e.target.value); setResultado(null); }}
            className="w-full h-12 px-3 rounded-lg border border-gray-300 text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {POOL_DOSIS_HA.map(u => (
              <option key={u.id} value={u.id}>{u.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Superficie (ha)</label>
          <input
            type="number"
            value={superficie}
            onChange={e => { setSuperficie(e.target.value); setResultado(null); }}
            placeholder="Ej: 4"
            className="w-full h-12 px-3 rounded-lg border border-gray-300 text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
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
