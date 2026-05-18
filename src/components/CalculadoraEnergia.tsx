import { useState } from 'react';
import type { ResultadoCalculo } from '../types';
import { convertirEnergia } from '../engines/motor_energia';
import ResultadoPanel from './ResultadoPanel';
import AdvertenciaPanel from './AdvertenciaPanel';

const COMBOS = [
  { origen: 'CV', destino: 'kW', label: 'CV → kW' },
  { origen: 'kW', destino: 'CV', label: 'kW → CV' },
  { origen: 'kW', destino: 'kWh', label: 'kW → kWh (consumo)' },
  { origen: 'CV', destino: 'kWh', label: 'CV → kWh (consumo)' },
  { origen: 'kWh', destino: 'kW', label: 'kWh → kW (potencia media)' },
];

export default function CalculadoraEnergia() {
  const [valor, setValor] = useState('');
  const [combo, setCombo] = useState('CV|kW');
  const [horas, setHoras] = useState('');
  const [resultado, setResultado] = useState<ResultadoCalculo | null>(null);
  const [errores, setErrores] = useState<string[]>([]);

  const [unidadOrigen, unidadDestino] = combo.split('|');
  const necesitaHoras = unidadDestino === 'kWh' || unidadOrigen === 'kWh';

  function calcular() {
    setErrores([]);
    setResultado(null);
    const v = parseFloat(valor.replace(',', '.'));
    const h = parseFloat(horas.replace(',', '.'));
    try {
      const res = convertirEnergia(
        isNaN(v) ? null : v,
        unidadOrigen,
        unidadDestino,
        necesitaHoras ? (isNaN(h) ? null : h) : null
      );
      setResultado(res);
    } catch (e) {
      setErrores([(e as Error).message]);
    }
  }

  function limpiar() {
    setValor('');
    setHoras('');
    setResultado(null);
    setErrores([]);
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
        Convierte potencia y energía agrícola: motores, bombas, grupos de presión e instalaciones solares.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
          <input
            type="number"
            value={valor}
            onChange={e => { setValor(e.target.value); setResultado(null); }}
            placeholder="Ej: 100"
            className="w-full h-12 px-3 rounded-lg border border-gray-300 text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Conversión</label>
          <select
            value={combo}
            onChange={e => { setCombo(e.target.value); setResultado(null); }}
            className="w-full h-12 px-3 rounded-lg border border-gray-300 text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {COMBOS.map(c => (
              <option key={`${c.origen}|${c.destino}`} value={`${c.origen}|${c.destino}`}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {necesitaHoras && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Horas de funcionamiento</label>
          <input
            type="number"
            value={horas}
            onChange={e => { setHoras(e.target.value); setResultado(null); }}
            placeholder="Ej: 5"
            className="w-full h-12 px-3 rounded-lg border border-gray-300 text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      )}

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
