import { useState } from 'react';
import clsx from 'clsx';
import { POOL_DOSIS_HA, POOL_DOSIS_HL, POOL_DOSIS_PCT, POOL_DOSIS_M2, POOL_DOSIS_M3, POOL_DOSIS_PORKG } from '../constants/units';
import {
  CULTIVOS, TIPOS_PLAGA, CALDO_RECOMENDADO, caldoMedio,
  type TipoCultivo, type TipoPlaga,
} from '../constants/caldo';
import {
  calcularPrescripcion, getUnitFamily, labelCantidad, placeholderCantidad,
  type ResultadoPrescripcion,
} from '../engines/motor_prescripcion';
import AdvertenciaPanel from './AdvertenciaPanel';

// ─── Helpers de formato y redondeo ───────────────────────────────────────────

function fmt(n: number, decimals = 4): string {
  const r = parseFloat(n.toPrecision(10));
  return r.toLocaleString('es-ES', { maximumFractionDigits: decimals });
}

function fmt1(n: number): string {
  return n.toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

// Redondea a valor medible con un medidor de campo (jeringa, probeta, vaso)
function roundToMeasurable(valor: number, unidad: string): string {
  const isVol = unidad === 'L';
  const isKg  = unidad === 'kg';
  if (!isVol && !isKg) return `${Math.round(valor)} ${unidad}`;

  const base = valor * 1000; // mL o g

  if (base < 5) {
    const r = Math.round(base * 2) / 2;
    return `${r.toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ${isVol ? 'mL' : 'g'}`;
  }
  if (base < 200) {
    const r = Math.round(base / 5) * 5;
    return `${r} ${isVol ? 'mL' : 'g'}`;
  }
  if (base < 1000) {
    const r = Math.round(base / 10) * 10;
    return `${r} ${isVol ? 'mL' : 'g'}`;
  }
  // > 1 L o 1 kg
  const r = Math.round(valor * 10) / 10;
  return `${fmt1(r)} ${unidad}`;
}

// Redondea AL ALZA al siguiente formato comercial habitual
const SIZES_L  = [0.05, 0.1, 0.15, 0.25, 0.5, 0.75, 1, 1.5, 2, 2.5, 3, 5, 10, 20, 25, 50, 100, 200];
const SIZES_KG = [0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10, 25, 50, 100, 500];

function roundUpForPurchase(valor: number, unidad: string): string {
  const sizes = unidad === 'L' ? SIZES_L : SIZES_KG;
  const size  = sizes.find(s => s >= valor) ?? Math.ceil(valor / 5) * 5;
  const sizeNum = typeof size === 'number' ? size : size;
  return `${sizeNum.toLocaleString('es-ES')} ${unidad}`;
}

// ─── Componentes internos ─────────────────────────────────────────────────────

function MetricCard({
  label, valor, unidad, color, nota,
}: { label: string; valor: string; unidad: string; color: 'green' | 'blue' | 'amber' | 'violet'; nota?: string }) {
  const styles: Record<string, string> = {
    green:  'bg-green-50  border-green-200  text-green-800',
    blue:   'bg-blue-50   border-blue-200   text-blue-800',
    amber:  'bg-amber-50  border-amber-200  text-amber-800',
    violet: 'bg-violet-50 border-violet-200 text-violet-800',
  };
  return (
    <div className={clsx('rounded-xl border p-4 text-center', styles[color])}>
      <p className="text-xs font-semibold uppercase tracking-wide mb-1 opacity-70">{label}</p>
      <p className="text-3xl font-bold">{valor}</p>
      <p className="text-sm font-medium mt-0.5 opacity-80">{unidad}</p>
      {nota && <p className="text-xs mt-2 opacity-60 border-t border-current border-opacity-20 pt-1.5">{nota}</p>}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function CalculadoraPrescripcion() {
  const [dosisValor, setDosisValor]             = useState('');
  const [dosisUnidad, setDosisUnidad]           = useState('cc/hL');
  const [cantidad, setCantidad]                 = useState('');
  const [cubaCapacidad, setCubaCapacidad]       = useState('1000');
  const [cultivo, setCultivo]                   = useState<string>('');
  const [tipoPlaga, setTipoPlaga]               = useState<TipoPlaga>('exterior');
  const [cultivoTexto, setCultivoTexto]         = useState('');
  const [caldoManual, setCaldoManual]           = useState('');
  const [resultado, setResultado]               = useState<ResultadoPrescripcion | null>(null);
  const [errores, setErrores]                   = useState<string[]>([]);

  const familia   = getUnitFamily(dosisUnidad);
  const esSpray   = familia === 'hl' || familia === 'pct' || familia === 'ha';
  const esOtro    = cultivo === 'otro';

  const caldoRango = (esSpray && cultivo && !esOtro)
    ? CALDO_RECOMENDADO[cultivo as TipoCultivo][tipoPlaga]
    : null;
  const caldoUsado = esOtro
    ? (parseFloat(caldoManual.replace(',', '.')) || null)
    : (caldoRango ? caldoMedio(caldoRango) : null);

  function calcular() {
    setErrores([]);
    setResultado(null);
    const d    = parseFloat(dosisValor.replace(',', '.'));
    const cant = parseFloat(cantidad.replace(',', '.'));
    const cuba = parseFloat(cubaCapacidad.replace(',', '.')) || 1000;
    try {
      const res = calcularPrescripcion(
        isNaN(d) ? null : d,
        dosisUnidad,
        isNaN(cant) ? null : cant,
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
    setDosisValor(''); setCantidad(''); setCubaCapacidad('1000');
    setCultivo(''); setTipoPlaga('exterior');
    setCultivoTexto(''); setCaldoManual('');
    setResultado(null); setErrores([]);
  }

  function onUnidadChange(u: string) {
    setDosisUnidad(u);
    setResultado(null);
    if (!esSpray) setCultivo('');
  }

  const infoFamilia: Record<string, string> = {
    hl:    'Dosis por cada 100 L de agua. Selecciona el cultivo para obtener el caldo recomendado y el plan de cubas.',
    pct:   'Porcentaje en la mezcla (% v/v). Ej: 0,1% = 100 mL por cada 100 L de agua.',
    ha:    'Dosis por hectárea. Se calcularán los totales directamente.',
    m2:    'Dosis por metro cuadrado. Introduce la superficie total a tratar en m².',
    m3:    'Dosis por metro cúbico. Introduce el volumen de la cámara o invernadero a fumigar.',
    porkg: 'Dosis por kg de material tratado. Introduce el peso total del producto a tratar (semillas, sustrato…).',
  };

  // Nombre del cultivo seleccionado para mostrar en resultados
  const cultivoLabel = esOtro
    ? (cultivoTexto || 'Cultivo personalizado')
    : (CULTIVOS.find(c => c.id === cultivo)?.label ?? '');

  return (
    <div className="space-y-5">

      {/* ─── Banner ─── */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-900">
        Elige la <strong>unidad que aparece en la etiqueta</strong> e introduce los datos de la
        parcela para obtener la cantidad práctica que el agricultor puede medir y comprar.
      </div>

      {/* ─── Sección 1: Dosis ─── */}
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
              onChange={e => onUnidadChange(e.target.value)}
              className="w-full h-12 px-3 rounded-lg border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <optgroup label="Por 100 L de agua (hL)">
                {POOL_DOSIS_HL.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
              </optgroup>
              <optgroup label="Porcentaje en mezcla">
                {POOL_DOSIS_PCT.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
              </optgroup>
              <optgroup label="Por hectárea (ha)">
                {POOL_DOSIS_HA.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
              </optgroup>
              <optgroup label="Por m² — suelo/invernadero">
                {POOL_DOSIS_M2.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
              </optgroup>
              <optgroup label="Por m³ — fumigación">
                {POOL_DOSIS_M3.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
              </optgroup>
              <optgroup label="Por kg tratado — semillas/sólidos">
                {POOL_DOSIS_PORKG.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
              </optgroup>
            </select>
          </div>
        </div>
        <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
          💡 {infoFamilia[familia]}
        </p>
      </div>

      {/* ─── Sección 2: Cantidad/Parcela ─── */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
          {familia === 'm2' ? 'Superficie a tratar'
           : familia === 'm3' ? 'Volumen a fumigar'
           : familia === 'porkg' ? 'Peso a tratar'
           : 'Tu parcela'}
        </h3>
        <div className={clsx('grid gap-3', esSpray ? 'grid-cols-2' : 'grid-cols-1')}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {labelCantidad(familia)}
            </label>
            <input
              type="number"
              value={cantidad}
              onChange={e => { setCantidad(e.target.value); setResultado(null); }}
              placeholder={placeholderCantidad(familia)}
              className="w-full h-12 px-3 rounded-lg border border-gray-300 text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          {esSpray && (
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
          )}
        </div>
      </div>

      {/* ─── Sección 3: Cultivo y plaga (solo spray) ─── */}
      {esSpray && (
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
                      : 'bg-white border-gray-300 text-gray-700 hover:border-green-400 hover:bg-green-50',
                  )}
                >
                  <span>{c.emoji}</span>
                  <span>{c.label}</span>
                </button>
              ))}
              {/* Botón "Otro cultivo" */}
              <button
                onClick={() => { setCultivo('otro'); setResultado(null); }}
                className={clsx(
                  'px-3 py-2 rounded-lg border text-sm font-medium transition-colors',
                  cultivo === 'otro'
                    ? 'bg-gray-700 border-gray-700 text-white shadow-sm'
                    : 'bg-white border-gray-300 text-gray-500 hover:border-gray-500 hover:bg-gray-50',
                )}
              >
                ✏️ Otro…
              </button>
              {cultivo && (
                <button
                  onClick={() => { setCultivo(''); setCultivoTexto(''); setCaldoManual(''); setResultado(null); }}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                  title="Quitar selección"
                >✕</button>
              )}
            </div>

            {/* Campos extra para cultivo personalizado */}
            {esOtro && (
              <div className="mt-3 space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del cultivo (opcional)</label>
                  <input
                    type="text"
                    value={cultivoTexto}
                    onChange={e => setCultivoTexto(e.target.value)}
                    placeholder="Ej: Aguacate, Mango, Alcachofa…"
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Caldo que aplicas normalmente (L/ha)
                  </label>
                  <input
                    type="number"
                    value={caldoManual}
                    onChange={e => { setCaldoManual(e.target.value); setResultado(null); }}
                    placeholder="Ej: 800"
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  {!caldoManual && (
                    <p className="text-xs text-amber-600 mt-1">
                      Sin este dato solo se calculará la dosis/ha, no el plan de cubas
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Tipo de plaga */}
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
                      : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400 hover:bg-blue-50',
                  )}
                >
                  <span className="block font-semibold">{t.label}</span>
                  <span className="block text-xs opacity-80 mt-0.5">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Preview caldo */}
          {caldoRango && !esOtro && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center gap-3">
              <span className="text-2xl">💧</span>
              <div>
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Caldo recomendado</p>
                <p className="text-lg font-bold text-blue-800">
                  {caldoRango.min}–{caldoRango.max}
                  <span className="text-base font-semibold ml-1">L/ha</span>
                  <span className="text-sm font-normal text-blue-600 ml-2">(usamos {caldoMedio(caldoRango)} L/ha)</span>
                </p>
                <p className="text-xs text-blue-600 mt-0.5">{caldoRango.nota}</p>
              </div>
            </div>
          )}
          {esOtro && caldoManual && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center gap-3">
              <span className="text-2xl">💧</span>
              <div>
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Caldo introducido</p>
                <p className="text-lg font-bold text-blue-800">
                  {fmt(parseFloat(caldoManual.replace(',', '.')))} <span className="text-base font-semibold">L/ha</span>
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Botones ─── */}
      <div className="flex gap-3 pt-1">
        <button onClick={calcular}
          className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg text-lg transition-colors">
          Calcular tratamiento
        </button>
        <button onClick={limpiar}
          className="h-12 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors">
          Limpiar
        </button>
      </div>

      {errores.length > 0 && <AdvertenciaPanel mensajes={errores} tipo="error" />}

      {/* ─── Resultados ─── */}
      {resultado && (
        <div className="space-y-4 border-t border-gray-100 pt-5">

          {/* Dosis/ha — solo spray */}
          {resultado.dosisHaValor !== undefined && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
              <p className="text-xs font-semibold text-green-600 uppercase tracking-widest mb-1">Dosis por hectárea</p>
              <p className="text-5xl font-bold text-green-700 leading-tight">{fmt(resultado.dosisHaValor)}</p>
              <p className="text-2xl font-semibold text-green-600 mt-1">{resultado.dosisHaUnidad}</p>
              {resultado.dosisOriginalNota && (
                <p className="text-xs text-green-500 mt-2">{resultado.dosisOriginalNota}</p>
              )}
            </div>
          )}

          {/* Caldo recomendado */}
          {resultado.caldoRango && resultado.caldoUsado && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">💧</span>
                <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">
                  Caldo recomendado · {cultivoLabel} · {TIPOS_PLAGA.find(t => t.id === tipoPlaga)?.label}
                </p>
              </div>
              <p className="text-2xl font-bold text-blue-800">
                {resultado.caldoRango.min}–{resultado.caldoRango.max}
                <span className="text-lg font-semibold ml-1">L/ha</span>
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Cálculo con <strong>{resultado.caldoUsado} L/ha</strong> (valor medio) · {resultado.caldoRango.nota}
              </p>
            </div>
          )}
          {esOtro && resultado.caldoUsado && !resultado.caldoRango && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">💧</span>
                <div>
                  <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">Caldo aplicado · {cultivoLabel}</p>
                  <p className="text-xl font-bold text-blue-800">{resultado.caldoUsado} L/ha</p>
                </div>
              </div>
            </div>
          )}

          {/* Plan de tratamiento */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
              {resultado.familia === 'm2'   ? `Plan para ${fmt(resultado.cantidad)} m²`
               : resultado.familia === 'm3' ? `Plan para ${fmt(resultado.cantidad)} m³`
               : resultado.familia === 'porkg' ? `Plan para ${fmt(resultado.cantidad)} kg de material`
               : `Plan para ${fmt(resultado.cantidad)} ha`}
            </p>

            {resultado.totalCaldo !== undefined && resultado.numCubas !== undefined && resultado.productoPorCubaValor !== undefined && resultado.productoPorCubaUnidad !== undefined ? (
              <div className="grid grid-cols-2 gap-3">
                <MetricCard
                  label="Total de caldo"
                  valor={fmt(resultado.totalCaldo, 0)}
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
                  label="Producto por cuba"
                  valor={fmt(resultado.productoPorCubaValor)}
                  unidad={resultado.productoPorCubaUnidad}
                  color="amber"
                  nota={`Mide: ${roundToMeasurable(resultado.productoPorCubaValor, resultado.productoPorCubaUnidad)}`}
                />
                <MetricCard
                  label="Total a comprar"
                  valor={fmt1(resultado.totalProductoValor)}
                  unidad={resultado.totalProductoUnidad}
                  color="green"
                  nota={`Compra: ${roundUpForPurchase(resultado.totalProductoValor, resultado.totalProductoUnidad)}`}
                />
              </div>
            ) : (
              <div className="space-y-3">
                <MetricCard
                  label="Total a comprar"
                  valor={fmt1(resultado.totalProductoValor)}
                  unidad={resultado.totalProductoUnidad}
                  color="green"
                  nota={`Compra: ${roundUpForPurchase(resultado.totalProductoValor, resultado.totalProductoUnidad)}`}
                />
                {esSpray && !resultado.caldoUsado && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800 text-center">
                    Selecciona cultivo y plaga para ver el plan completo de cubas y caldo
                  </div>
                )}
              </div>
            )}
          </div>

          {resultado.advertencias.length > 0 && (
            <AdvertenciaPanel mensajes={resultado.advertencias} tipo="advertencia" />
          )}
        </div>
      )}
    </div>
  );
}
