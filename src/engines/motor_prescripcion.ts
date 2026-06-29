import { FACTOR_HL, POOL_DOSIS_HL } from '../constants/units';
import type { RangoCaldo } from '../constants/caldo';

export interface ResultadoPrescripcion {
  // Dosis/ha normalizada a L/ha o kg/ha
  dosisHaValor: number;
  dosisHaUnidad: string;
  dosisOriginalNota?: string; // note if simplified from original unit

  // Caldo
  caldoUsado: number | null;
  caldoRango: RangoCaldo | null;

  // Plan para la parcela
  superficie: number;
  totalProductoValor: number;
  totalProductoUnidad: string;
  totalCaldo: number | null;
  numCubas: number | null;
  productoPorCubaValor: number | null;
  productoPorCubaUnidad: string | null;
  cubaCapacidad: number;

  advertencias: string[];
}

function fmt(n: number): string {
  return parseFloat(n.toPrecision(10)).toLocaleString('es-ES', { maximumFractionDigits: 6 });
}

function esHlUnidad(unidad: string): boolean {
  return POOL_DOSIS_HL.some(u => u.id === unidad);
}

function esPesoUnidad(unidad: string): boolean {
  return unidad.startsWith('kg') || unidad.startsWith('g/') || unidad.startsWith('t/');
}

// Converts any dose unit to L/ha or kg/ha.
// For /hL units, caldoLHa must be provided.
// Returns { valor, unidad, nota? }
function normalizeAHa(
  dosisValor: number,
  dosisUnidad: string,
  caldoLHa: number | null
): { valor: number; unidad: string; nota?: string } {
  const isPeso = esPesoUnidad(dosisUnidad);

  if (esHlUnidad(dosisUnidad)) {
    if (caldoLHa === null) throw new Error('Falta el volumen de caldo (selecciona cultivo y tipo de plaga)');

    const factorNorm = FACTOR_HL[dosisUnidad] ?? 1;
    const dosisNorm = dosisValor * factorNorm; // numerator normalized by HL factor
    const hLporHa = caldoLHa / 100;
    const valorRaw = dosisNorm * hLporHa; // in original numerator unit per ha

    // Determine numerator unit
    const numerador = dosisUnidad.split('/')[0]; // cc, mL, L, g, kg
    const isPesoNumerador = numerador === 'g' || numerador === 'kg' || numerador === 't';

    if (isPesoNumerador) {
      // Convert to kg
      let valorKg: number;
      if (numerador === 'g') valorKg = valorRaw / 1000;
      else if (numerador === 't') valorKg = valorRaw * 1000;
      else valorKg = valorRaw; // kg

      const nota = numerador !== 'kg' ? `Original: ${fmt(valorRaw)} ${numerador}/ha` : undefined;
      return { valor: valorKg, unidad: 'kg/ha', nota };
    } else {
      // Convert to L
      let valorL: number;
      if (numerador === 'mL' || numerador === 'cc') valorL = valorRaw / 1000;
      else if (numerador === 'm³') valorL = valorRaw * 1000;
      else valorL = valorRaw; // L

      const nota = (numerador !== 'L') ? `Original: ${fmt(valorRaw)} ${numerador}/ha` : undefined;
      return { valor: valorL, unidad: 'L/ha', nota };
    }
  } else {
    // /ha unit — convert to base (kg/ha or L/ha)
    const factoresHa: Record<string, number> = {
      'kg/ha': 1,     'g/ha': 0.001,   't/ha': 1000,
      'L/ha':  1,     'mL/ha': 0.001,  'cc/ha': 0.001,  'm³/ha': 1000,
    };
    const factor = factoresHa[dosisUnidad];
    if (factor === undefined) throw new Error(`Unidad no reconocida: ${dosisUnidad}`);

    const valorBase = dosisValor * factor;
    const unidadBase = isPeso ? 'kg/ha' : 'L/ha';
    const nota = dosisUnidad !== unidadBase ? `Original: ${fmt(dosisValor)} ${dosisUnidad}` : undefined;
    return { valor: valorBase, unidad: unidadBase, nota };
  }
}

// Simplify display for small values (e.g. 0.001 kg → show as g too)
function formatConUnidad(valor: number, unidad: string): { texto: string } {
  return { texto: `${fmt(valor)} ${unidad}` };
}

export function calcularPrescripcion(
  dosisValor: number | null,
  dosisUnidad: string,
  superficie: number | null,
  caldoLHa: number | null,
  caldoRango: RangoCaldo | null,
  cubaCapacidad: number
): ResultadoPrescripcion {
  const advertencias: string[] = [];

  if (!dosisValor || dosisValor <= 0) throw new Error('Introduce una dosis válida mayor que 0');
  if (!superficie || superficie <= 0) throw new Error('Introduce la superficie en ha');
  if (cubaCapacidad <= 0) throw new Error('La capacidad de la cuba debe ser mayor que 0');

  // 1. Normalize dose to L/ha or kg/ha
  const { valor: dosisHaValor, unidad: dosisHaUnidad, nota: dosisOriginalNota } =
    normalizeAHa(dosisValor, dosisUnidad, caldoLHa);

  // 2. Total product for the surface
  const totalProductoValor = dosisHaValor * superficie;
  const totalProductoUnidad = dosisHaUnidad.replace('/ha', ''); // 'kg' or 'L'

  // 3. Total caldo and cubas (only if caldo is available)
  let totalCaldo: number | null = null;
  let numCubas: number | null = null;
  let productoPorCubaValor: number | null = null;
  let productoPorCubaUnidad: string | null = null;

  if (caldoLHa !== null) {
    totalCaldo = caldoLHa * superficie;
    numCubas = Math.ceil(totalCaldo / cubaCapacidad);
    productoPorCubaValor = totalProductoValor / numCubas;
    productoPorCubaUnidad = totalProductoUnidad;
  }

  // 4. Warnings
  if (dosisHaValor > 100) {
    advertencias.push('Dosis por hectárea muy elevada — verifica las unidades del producto');
  }
  if (caldoLHa === null) {
    advertencias.push('Selecciona el cultivo y tipo de plaga para ver el número de cubas y el plan de tratamiento completo');
  }

  void formatConUnidad; // suppress unused warning

  return {
    dosisHaValor,
    dosisHaUnidad,
    dosisOriginalNota,
    caldoUsado: caldoLHa,
    caldoRango,
    superficie,
    totalProductoValor,
    totalProductoUnidad,
    totalCaldo,
    numCubas,
    productoPorCubaValor,
    productoPorCubaUnidad,
    cubaCapacidad,
    advertencias,
  };
}
