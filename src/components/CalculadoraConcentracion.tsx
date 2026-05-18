import { useState } from 'react';
import type { ResultadoCalculo } from '../types';
import { convertirConcentracion } from '../engines/motor_concentracion';
import ResultadoPanel from './ResultadoPanel';
import AdvertenciaPanel from './AdvertenciaPanel';

export default function CalculadoraConcentracion() {
  const [valor, setValor] = useState('');
  const [unidadOrigen, setUnidadOrigen] = useState('mg/L');
  const [resultado, setResultado] = useState<ResultadoCalculo | null>(null);
  const [errores, setErrores] = useState<string[]>([]);

  function calcular() {
    setErrores([]);
    setResultado(null);
    const v = parseFloat(valor.replace(',', '.'));
    try {
      const res = convertirConcentracion(isNaN(v) ? null : v, unidadOrigen);
      setResultado(res);
    } catch (e) {
      setErrores([(e as Error).message]);
    }
  }

  function limpiar() {
    setValor('');
    setResultado(null);
    setErrores([]);
  }

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
        La equivalencia <strong>1 mg/L ≈ 1 ppm</strong> es válida solo para soluciones acuosas
        (densidad ≈ 1 kg/L). Para soluciones más densas, el valor real puede diferir.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
          <input
            type="number"
            value={valor}
            onChange={e => { setValor(e.target.value); setResultado(null); }}
            placeholder="Ej: 25"
            className="w-full h-12 px-3 rounded-lg border border-gray-300 text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Convertir de</label>
          <select
            value={unidadOrigen}
            onChange={e => { setUnidadOrigen(e.target.value); setResultado(null); }}
            className="w-full h-12 px-3 rounded-lg border border-gray-300 text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="mg/L">mg/L → ppm</option>
            <option value="ppm">ppm → mg/L</option>
          </select>
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
