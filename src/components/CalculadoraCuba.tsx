import { useState } from 'react';
import type { ResultadoCalculo } from '../types';
import { POOL_DOSIS_HL } from '../constants/units';
import { calcularCuba } from '../engines/motor_cuba';
import ResultadoPanel from './ResultadoPanel';
import AdvertenciaPanel from './AdvertenciaPanel';

export default function CalculadoraCuba() {
  const [dosis, setDosis] = useState('');
  const [unidadDosis, setUnidadDosis] = useState('cc/hL');
  const [litrosCuba, setLitrosCuba] = useState('');
  const [resultado, setResultado] = useState<ResultadoCalculo | null>(null);
  const [errores, setErrores] = useState<string[]>([]);

  function calcular() {
    setErrores([]);
    setResultado(null);
    const d = parseFloat(dosis.replace(',', '.'));
    const lc = parseFloat(litrosCuba.replace(',', '.'));
    try {
      const res = calcularCuba(isNaN(d) ? null : d, unidadDosis, isNaN(lc) ? null : lc);
      setResultado(res);
    } catch (e) {
      setErrores([(e as Error).message]);
    }
  }

  function limpiar() {
    setDosis('');
    setLitrosCuba('');
    setResultado(null);
    setErrores([]);
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
        Calcula la cantidad de producto necesaria para llenar una cuba completa.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dosis</label>
          <input
            type="number"
            value={dosis}
            onChange={e => { setDosis(e.target.value); setResultado(null); }}
            placeholder="Ej: 150"
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad cuba (L)</label>
          <input
            type="number"
            value={litrosCuba}
            onChange={e => { setLitrosCuba(e.target.value); setResultado(null); }}
            placeholder="Ej: 1000"
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
