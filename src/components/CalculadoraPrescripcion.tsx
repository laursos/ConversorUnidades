import { useState } from 'react';
import clsx from 'clsx';
import { POOL_DOSIS_HA, POOL_DOSIS_HL } from '../constants/units';
import {
  CULTIVOS, TIPOS_PLAGA, CALDO_RECOMENDADO, caldoMedio,
  type TipoCultivo, type TipoPlaga,
} from '../constants/caldo';
import { calcularPrescripcion, type ResultadoPrescripcion } from '../engines/motor_prescripcion';
import AdvertenciaPanel from './AdvertenciaPanel';

function fmt(n: number): string {
  const rounded = parseFloat(n.toPrecision(10));
  if (Number.isInteger(rounded)) return rounded.toLocaleString('es-ES');
  return rounded.toLocaleString('es-ES', { maximumFractionDigits: 4 });
}

function MetricCard({
  label, valor, unidad, color,
}: { label: string; valor: string; unidad: string; color: 'green' | 'blue' | 'amber' | 'violet' }) {
  const colorMap = {
    green:  'bg-green-50  border-green-200  text-green-800  text-green-600',
    blue:   'bg-blue-50   border-blue-200   text-blue-800   text-blue-600',
    amber:  'bg-amber-50  border-amber-200  text-amber-800  text-amber-600',
    violet: 'bg-violet-50 border-violet-200 text-violet-800 text-violet-600',
  };
  const [bgBorder, textLabel, textUnidad] = colorMap[color].split('  ');

  return (
    <div className={clsx('rounded-xl border p-4 text-center', bgBorder)}>
      <p className={clsx('text-xs font-semibold uppercase tracking-wide mb-1', textLabel)}>{label}</p>
      <p className={clsx('text-3xl font-bold', textLabel)}>{valor}</p>
      <p className={clsx('text-sm font-medium mt-0.5', textUnidad)}>{unidad}</p>
    </div>
  );
}

export default function CalculadoraPrescripcion() {
  const [dosisValor, setDosisValor] = useState('');
  const [dosisUnidad, setDosisUnidad] = useState('cc/hL');
  const [superficie, setSuperficie] = useState('');
  const [cubaCapacidad, setCubaCapacidad] = useState('1000');
  const [cultivo, setCultivo] = useState<TipoCultivo | ''>('');
  const [tipoPlaga, setTipoPlaga] = useState<TipoPlaga>('exterior');

  const [resultado, setResultado] = useState<ResultadoPrescripcion | null>(null);
  const [errores, setErrores] = useState<string[]>([]);

  const caldoRango = cultivo ? CALDO_RECOMENDADO[cultivo][tipoPlaga] : null;
  const caldoUsado = caldoRango ? caldoMedio(caldoRango) : null;

  function calcular() {
    setErrores([]);
    setResultado(null);

    const d = parseFloat(dosisValor.replace(',', '.'));
    const s = parseFloat(superficie.replace(',', '.'));
    const cuba = parseFloat(cubaCapacidad.replace(',', '.')) || 1000;

    try {
      const res = calcularPrescripcion(
        isNaN(d) ? null : d,
        dosisUnidad,
        isNaN(s) ? null : s,
        caldoUsado,
        caldoRango,
        cuba,
      );
      setResultado(res);
    } catch (e) {
      setErrores([(e as Error).message]);
    }
  }

  function limpiar() {
    setDosisValor('');
    setSuperficie('');
    setCubaCapacidad('1000');
    setCultivo('');
    setTipoPlaga('exterior');
    setResultado(null);
    setErrores([]);
  }

  return (
    <div className="space-y-5">
      {/* Intro */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-900">
        Introduce la <strong>dosis de la etiqueta</strong> y los datos de la parcela para obtener
        la dosis por hectárea, el plan por cuba y el total de producto necesario.
      </div>

      {/* ─── Sección 1: Dosis etiqueta ─── */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Dosis en etiqueta</h3>
        <div className="grid grid-cols-5 gap-2">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
            <input
              type="number"
              value={dosisValor}
              onChange={e => { setDosisValor(e.target.value); setResultado(null); }}
              placeholder="Ej: 150"
              className="w-full h-12 px-3 rounded-lg border border-gray-300 text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Unidad de la etiqueta</label>
            <select
              value={dosisUnidad}
              onChange={e => { setDosisUnidad(e.target.value); setResultado(null); }}
              className="w-full h-12 px-3 rounded-lg border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <optgroup label="Por 100 litros de agua (hL)">
                {POOL_DOSIS_HL.map(u => (
                  <option key={u.id} value={u.id}>{u.label}</option>
                ))}
              </optgroup>
              <optgroup label="Por hectárea (ha)">
                {POOL_DOSIS_HA.map(u => (
                  <option key={u.id} value={u.id}>{u.label}</option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>
      </div>

      {/* ─── Sección 2: Parcela ─── */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Tu parcela</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Superficie (ha)</label>
            <input
              type="number"
              value={superficie}
              onChange={e => { setSuperficie(e.target.value); setResultado(null); }}
              placeholder="Ej: 3,5"
              className="w-full h-12 px-3 rounded-lg border border-gray-300 text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad cuba (L)</label>
            <input
              type="number"
              value={cubaCapacidad}
              onChange={e => { setCubaCapacidad(e.target.value); setResultado(null); }}
              placeholder="1000"
              className="w-full h-12 px-3 rounded-lg border border-gray-300 text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      {/* ─── Sección 3: Cultivo y plaga ─── */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Cultivo y tipo de plaga</h3>

        {/* Cultivos */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Cultivo</p>
          <div className="flex flex-wrap gap-2">
            {CULTIVOS.map(c => (
              <button
                key={c.id}
                onClick={() => { setCultivo(c.id); setResultado(null); }}
                className={clsx(
                  'px-3 py-2 rounded-lg border text-sm font-medium transition-colors flex items-center gap-1.5',
                  cultivo === c.id
                    ? 'bg-green-600 border-green-600 text-white shadow-sm'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-green-400 hover:bg-green-50'
                )}
              >
                <span>{c.emoji}</span>
                <span>{c.label}</span>
              </button>
            ))}
            {cultivo && (
              <button
                onClick={() => { setCultivo(''); setResultado(null); }}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                title="Quitar selección"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Tipo plaga */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Tipo de tratamiento</p>
          <div className="flex gap-2">
            {TIPOS_PLAGA.map(t => (
              <button
                key={t.id}
                onClick={() => { setTipoPlaga(t.id); setResultado(null); }}
                className={clsx(
                  'flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors',
                  tipoPlaga === t.id
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400 hover:bg-blue-50'
                )}
              >
                <span className="block font-semibold">{t.label}</span>
                <span className="block text-xs opacity-80 mt-0.5">{t.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Caldo recomendado preview */}
        {caldoRango && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center gap-3">
            <span className="text-2xl">💧</span>
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Caldo recomendado</p>
              <p className="text-lg font-bold text-blue-800">
                {caldoRango.min}–{caldoRango.max} <span className="text-base font-semibold">L/ha</span>
                <span className="text-sm font-normal text-blue-600 ml-2">(usamos {caldoUsado} L/ha)</span>
              </p>
              <p className="text-xs text-blue-600 mt-0.5">{caldoRango.nota}</p>
            </div>
          </div>
        )}
      </div>

      {/* ─── Botones ─── */}
      <div className="flex gap-3 pt-1">
        <button
          onClick={calcular}
          className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg text-lg transition-colors"
        >
          Calcular tratamiento
        </button>
        <button
          onClick={limpiar}
          className="h-12 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"
        >
          Limpiar
        </button>
      </div>

      {/* ─── Errores ─── */}
      {errores.length > 0 && <AdvertenciaPanel mensajes={errores} tipo="error" />}

      {/* ─── Resultados ─── */}
      {resultado && (
        <div className="space-y-4 border-t border-gray-100 pt-5">

          {/* Dosis por hectárea */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
            <p className="text-xs font-semibold text-green-600 uppercase tracking-widest mb-1">
              Dosis por hectárea
            </p>
            <p className="text-5xl font-bold text-green-700 leading-tight">
              {fmt(resultado.dosisHaValor)}
            </p>
            <p className="text-2xl font-semibold text-green-600 mt-1">{resultado.dosisHaUnidad}</p>
            {resultado.dosisOriginalNota && (
              <p className="text-xs text-green-500 mt-2">{resultado.dosisOriginalNota}</p>
            )}
          </div>

          {/* Caldo del resultado */}
          {resultado.caldoRango && resultado.caldoUsado && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">💧</span>
                <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">
                  Caldo recomendado · {CULTIVOS.find(c => c.id === cultivo)?.label}
                  {' '}· {TIPOS_PLAGA.find(t => t.id === tipoPlaga)?.label}
                </p>
              </div>
              <p className="text-2xl font-bold text-blue-800">
                {resultado.caldoRango.min}–{resultado.caldoRango.max}
                <span className="text-lg font-semibold ml-1">L/ha</span>
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Cálculo realizado con <strong>{resultado.caldoUsado} L/ha</strong> (valor medio) · {resultado.caldoRango.nota}
              </p>
            </div>
          )}

          {/* Plan de tratamiento */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
              Plan para {fmt(resultado.superficie)} ha
            </p>

            {resultado.totalCaldo !== null && resultado.numCubas !== null && resultado.productoPorCubaValor !== null ? (
              <div className="grid grid-cols-2 gap-3">
                <MetricCard
                  label="Total de caldo"
                  valor={fmt(resultado.totalCaldo)}
                  unidad="L"
                  color="blue"
                />
                <MetricCard
                  label={`Cubas (${resultado.cubaCapacidad} L)`}
                  valor={String(resultado.numCubas)}
                  unidad="llenados"
                  color="violet"
                />
                <MetricCard
                  label="Producto/cuba"
                  valor={fmt(resultado.productoPorCubaValor)}
                  unidad={resultado.productoPorCubaUnidad ?? ''}
                  color="amber"
                />
                <MetricCard
                  label="Total producto"
                  valor={fmt(resultado.totalProductoValor)}
                  unidad={resultado.totalProductoUnidad}
                  color="green"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                <MetricCard
                  label="Total producto"
                  valor={fmt(resultado.totalProductoValor)}
                  unidad={resultado.totalProductoUnidad}
                  color="green"
                />
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800 text-center">
                  Selecciona cultivo y plaga para ver el plan completo de cubas y caldo
                </div>
              </div>
            )}
          </div>

          {/* Advertencias */}
          {resultado.advertencias.length > 0 && (
            <AdvertenciaPanel mensajes={resultado.advertencias} tipo="advertencia" />
          )}
        </div>
      )}
    </div>
  );
}
