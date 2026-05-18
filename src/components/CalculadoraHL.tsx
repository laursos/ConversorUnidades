import { useState } from 'react';
import type { ResultadoCalculo } from '../types';
import { POOL_DOSIS_HL } from '../constants/units';
import { convertirHL } from '../engines/motor_hl';
import ResultadoPanel from './ResultadoPanel';
import AdvertenciaPanel from './AdvertenciaPanel';

export default function CalculadoraHL() {
  const [dosis, setDosis] = useState('');
  const [unidadDosis, setUnidadDosis] = useState('L/hL');
  const [volCaldo, setVolCaldo] = useState('');
  const [resultado, setResultado] = useState<ResultadoCalculo | null>(null);
  const [errores, setErrores] = useState<string[]>([]);

  function calcular() {
    setErrores([]);
    setResultado(null);
    const d = parseFloat(dosis.replace(',', '.'));
    const vc = parseFloat(volCaldo.replace(',', '.'));
    try {
      const res = convertirHL(isNaN(d) ? null : d, unidadDosis, isNaN(vc) ? null : vc);
      setResultado(res);
    } catch (e) {
      setErrores([(e as Error).message]);
    }
  }

  function limpiar() {
    setDosis('');
    setVolCaldo('');
    setResultado(null);
    setErrores([]);
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
        Convierte la dosis en <strong>L/hL, g/hL, cc/hL…</strong> a la cantidad necesaria por hectárea,
        conociendo el volumen de caldo aplicado.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dosis</label>
          <input
            type="number"
            value={dosis}
            onChange={e => { setDosis(e.target.value); setResultado(null); }}
            placeholder="Ej: 0,12"
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
            {POOL_DOSIS_HL.map(u => (
              <option key={u.id} value={u.id}>{u.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Volumen de caldo (L/ha)</label>
          <input
            type="number"
            value={volCaldo}
            onChange={e => { setVolCaldo(e.target.value); setResultado(null); }}
            placeholder="Ej: 2500"
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
