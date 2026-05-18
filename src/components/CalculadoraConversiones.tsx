import { useState, useMemo } from 'react';
import type { ResultadoCalculo } from '../types';
import { POOL_BASICAS, UNIT_GROUP_MAP } from '../constants/units';
import { convertirBasico } from '../engines/motor_conversiones';
import ResultadoPanel from './ResultadoPanel';
import AdvertenciaPanel from './AdvertenciaPanel';

const DOSIS_HA_UNITS = [
  { id: 'kg/ha', label: 'kg/ha' }, { id: 'g/ha', label: 'g/ha' },
  { id: 't/ha', label: 't/ha' }, { id: 'L/ha', label: 'L/ha' },
  { id: 'mL/ha', label: 'mL/ha' }, { id: 'cc/ha', label: 'cc/ha' },
  { id: 'm³/ha', label: 'm³/ha' },
];

const ALL_UNITS = [
  ...POOL_BASICAS.map(u => ({ id: u.id, label: u.label, group: u.group })),
  ...DOSIS_HA_UNITS.map(u => ({ id: u.id, label: u.label, group: 'dosis_ha' as const })),
];

export default function CalculadoraConversiones() {
  const [valor, setValor] = useState('');
  const [origen, setOrigen] = useState('kg');
  const [destino, setDestino] = useState('g');
  const [resultado, setResultado] = useState<ResultadoCalculo | null>(null);
  const [errores, setErrores] = useState<string[]>([]);

  const opcionesDestino = useMemo(() => {
    const grupoOrigen = UNIT_GROUP_MAP[origen] ?? ALL_UNITS.find(u => u.id === origen)?.group;
    return ALL_UNITS.filter(u => u.group === grupoOrigen && u.id !== origen);
  }, [origen]);

  function calcular() {
    setErrores([]);
    setResultado(null);
    const v = parseFloat(valor.replace(',', '.'));
    try {
      const res = convertirBasico(isNaN(v) ? null : v, origen, destino);
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
          <input
            type="number"
            value={valor}
            onChange={e => { setValor(e.target.value); setResultado(null); }}
            placeholder="Ej: 1,6"
            className="w-full h-12 px-3 rounded-lg border border-gray-300 text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Unidad origen</label>
          <select
            value={origen}
            onChange={e => { setOrigen(e.target.value); setResultado(null); setDestino(''); }}
            className="w-full h-12 px-3 rounded-lg border border-gray-300 text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {ALL_UNITS.map(u => (
              <option key={u.id} value={u.id}>{u.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Unidad destino</label>
          <select
            value={destino}
            onChange={e => { setDestino(e.target.value); setResultado(null); }}
            className="w-full h-12 px-3 rounded-lg border border-gray-300 text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {opcionesDestino.map(u => (
              <option key={u.id} value={u.id}>{u.label}</option>
            ))}
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
