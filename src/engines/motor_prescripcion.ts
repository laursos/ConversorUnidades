import { FACTOR_HL, POOL_DOSIS_HL, POOL_DOSIS_HA } from '../constants/units';
import type { RangoCaldo } from '../constants/caldo';

// ─── Familia de unidad ────────────────────────────────────────────────────────

export type FamiliaUnidad = 'hl' | 'pct' | 'ha' | 'm2' | 'm3' | 'porkg';

const HL_IDS  = new Set(POOL_DOSIS_HL.map(u => u.id));
const HA_IDS  = new Set(POOL_DOSIS_HA.map(u => u.id));
const M2_IDS  = new Set(['kg/m2','g/m2','L/m2','mL/m2','cc/m2']);
const M3_IDS  = new Set(['kg/m3','g/m3','L/m3','mL/m3','cc/m3','t/m3']);
const KG_IDS  = new Set(['mL/kg','cc/kg','L/kg','kg/kg','g/kg']);

export function getUnitFamily(unidad: string): FamiliaUnidad {
  if (unidad === '%')        return 'pct';
  if (HL_IDS.has(unidad))   return 'hl';
  if (HA_IDS.has(unidad))   return 'ha';
  if (M2_IDS.has(unidad))   return 'm2';
  if (M3_IDS.has(unidad))   return 'm3';
  if (KG_IDS.has(unidad))   return 'porkg';
  return 'ha';
}

// Label para el campo de cantidad según familia
export function labelCantidad(familia: FamiliaUnidad): string {
  switch (familia) {
    case 'm2':    return 'Superficie (m²)';
    case 'm3':    return 'Volumen estructura (m³)';
    case 'porkg': return 'Peso a tratar (kg)';
    default:      return 'Superficie (ha)';
  }
}

export function placeholderCantidad(familia: FamiliaUnidad): string {
  switch (familia) {
    case 'm2':    return 'Ej: 500';
    case 'm3':    return 'Ej: 300';
    case 'porkg': return 'Ej: 1000';
    default:      return 'Ej: 3,5';
  }
}

// ─── Resultado ────────────────────────────────────────────────────────────────

export interface ResultadoPrescripcion {
  familia: FamiliaUnidad;

  // Siempre presente
  totalProductoValor: number;
  totalProductoUnidad: string;
  cantidad: number;           // ha / m2 / m3 / kg
  cantidadUnidad: string;     // 'ha', 'm²', 'm³', 'kg'

  // Solo para spray (hl, pct, ha)
  dosisHaValor?: number;
  dosisHaUnidad?: string;
  dosisOriginalNota?: string;
  caldoUsado?: number;
  caldoRango?: RangoCaldo;
  totalCaldo?: number;
  numCubas?: number;
  productoPorCubaValor?: number;
  productoPorCubaUnidad?: string;
  cubaCapacidad?: number;

  advertencias: string[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return parseFloat(n.toPrecision(10)).toLocaleString('es-ES', { maximumFractionDigits: 6 });
}

function esPesoNumerador(unidad: string): boolean {
  const n = unidad.split('/')[0];
  return n === 'kg' || n === 'g' || n === 't';
}

// Normaliza a kg o L por unidad de denominador (m2, m3 o kg)
function normalizarNumerador(dosisValor: number, unidad: string): { valor: number; unidad: string; nota?: string } {
  const num = unidad.split('/')[0];
  const factores: Record<string, number> = {
    kg: 1, g: 0.001, t: 1000,
    L: 1, mL: 0.001, cc: 0.001,
  };
  const factor = factores[num] ?? 1;
  const valorBase = dosisValor * factor;
  const unidadBase = esPesoNumerador(unidad) ? 'kg' : 'L';
  const nota = num !== unidadBase ? `Original: ${fmt(dosisValor)} ${unidad}` : undefined;
  return { valor: valorBase, unidad: unidadBase, nota };
}

// Para /ha: normaliza a kg/ha o L/ha
function normalizeAHa(
  dosisValor: number,
  dosisUnidad: string,
  caldoLHa: number | null,
): { valor: number; unidad: string; nota?: string } {
  const familia = getUnitFamily(dosisUnidad);

  if (familia === 'pct') {
    // X% (v/v) = X L de producto por 100 L de caldo = X L/hL
    if (caldoLHa === null) throw new Error('Para unidades % selecciona el cultivo y tipo de plaga');
    const dosisLHL = dosisValor;          // X% → X L/hL
    const hLporHa  = caldoLHa / 100;
    const valorBruto = dosisLHL * hLporHa; // L/ha
    const nota = `Original: ${fmt(dosisValor)} % = ${fmt(dosisLHL)} L/hL`;
    return { valor: valorBruto, unidad: 'L/ha', nota };
  }

  if (familia === 'hl') {
    if (caldoLHa === null) throw new Error('Para unidades /hL selecciona el cultivo y tipo de plaga');
    const factorNorm  = FACTOR_HL[dosisUnidad] ?? 1;
    const dosisNorm   = dosisValor * factorNorm;
    const hLporHa     = caldoLHa / 100;
    const valorBruto  = dosisNorm * hLporHa;
    const num         = dosisUnidad.split('/')[0];
    const isPesoNum   = esPesoNumerador(dosisUnidad);

    let valorFinal: number;
    let unidadFinal: string;
    let nota: string | undefined;

    if (isPesoNum) {
      const factores: Record<string, number> = { kg: 1, g: 0.001, t: 1000 };
      const factor = factores[num] ?? 1;
      valorFinal = valorBruto * factor;
      unidadFinal = 'kg/ha';
      if (num !== 'kg') nota = `Original: ${fmt(valorBruto)} ${num}/ha`;
    } else {
      const factores: Record<string, number> = { L: 1, mL: 0.001, cc: 0.001 };
      const factor = factores[num] ?? 1;
      valorFinal = valorBruto * factor;
      unidadFinal = 'L/ha';
      if (num !== 'L') nota = `Original: ${fmt(valorBruto)} ${num}/ha`;
    }
    return { valor: valorFinal, unidad: unidadFinal, nota };
  }

  // familia === 'ha'
  const factores: Record<string, number> = {
    'kg/ha': 1, 'g/ha': 0.001, 't/ha': 1000,
    'L/ha': 1,  'mL/ha': 0.001, 'cc/ha': 0.001, 'm³/ha': 1000,
  };
  const factor = factores[dosisUnidad];
  if (factor === undefined) throw new Error(`Unidad no reconocida: ${dosisUnidad}`);
  const valorBase = dosisValor * factor;
  const unidadBase = esPesoNumerador(dosisUnidad) ? 'kg/ha' : 'L/ha';
  const nota = dosisUnidad !== unidadBase ? `Original: ${fmt(dosisValor)} ${dosisUnidad}` : undefined;
  return { valor: valorBase, unidad: unidadBase, nota };
}

// ─── Motor principal ──────────────────────────────────────────────────────────

export function calcularPrescripcion(
  dosisValor: number | null,
  dosisUnidad: string,
  cantidad: number | null,      // ha, m2, m3 o kg según familia
  caldoLHa: number | null,
  caldoRango: RangoCaldo | null,
  cubaCapacidad: number,
): ResultadoPrescripcion {
  if (!dosisValor || dosisValor <= 0) throw new Error('Introduce una dosis válida mayor que 0');
  if (!cantidad || cantidad <= 0)     throw new Error(
    getUnitFamily(dosisUnidad) === 'ha' || getUnitFamily(dosisUnidad) === 'hl' || getUnitFamily(dosisUnidad) === 'pct'
      ? 'Introduce la superficie en ha'
      : getUnitFamily(dosisUnidad) === 'm2'
      ? 'Introduce la superficie en m²'
      : getUnitFamily(dosisUnidad) === 'm3'
      ? 'Introduce el volumen de la estructura en m³'
      : 'Introduce el peso a tratar en kg',
  );
  if (cubaCapacidad <= 0) throw new Error('La capacidad de la cuba debe ser mayor que 0');

  const familia = getUnitFamily(dosisUnidad);
  const advertencias: string[] = [];

  // ── Familias de spray (hl, pct, ha) ──────────────────────────────────────
  if (familia === 'hl' || familia === 'pct' || familia === 'ha') {
    const superficieHa = cantidad;

    const { valor: dosisHaValor, unidad: dosisHaUnidad, nota: dosisOriginalNota } =
      normalizeAHa(dosisValor, dosisUnidad, caldoLHa);

    const totalProductoValor = dosisHaValor * superficieHa;
    const totalProductoUnidad = dosisHaUnidad.replace('/ha', ''); // 'kg' o 'L'

    if (dosisHaValor > 100) {
      advertencias.push('Dosis por hectárea muy elevada — verifica las unidades del producto');
    }

    let totalCaldo: number | undefined;
    let numCubas: number | undefined;
    let productoPorCubaValor: number | undefined;
    let productoPorCubaUnidad: string | undefined;

    if (caldoLHa !== null) {
      totalCaldo = caldoLHa * superficieHa;
      numCubas = Math.ceil(totalCaldo / cubaCapacidad);
      productoPorCubaValor = totalProductoValor / numCubas;
      productoPorCubaUnidad = totalProductoUnidad;
    } else {
      advertencias.push('Selecciona cultivo y plaga para ver el plan de cubas y caldo');
    }

    return {
      familia,
      totalProductoValor,
      totalProductoUnidad,
      cantidad: superficieHa,
      cantidadUnidad: 'ha',
      dosisHaValor,
      dosisHaUnidad,
      dosisOriginalNota,
      caldoUsado: caldoLHa ?? undefined,
      caldoRango: caldoRango ?? undefined,
      totalCaldo,
      numCubas,
      productoPorCubaValor,
      productoPorCubaUnidad,
      cubaCapacidad,
      advertencias,
    };
  }

  // ── Familia m2 (por m²) ───────────────────────────────────────────────────
  if (familia === 'm2') {
    const { valor: dosisBase, unidad: unidadBase, nota } = normalizarNumerador(dosisValor, dosisUnidad);
    const totalProductoValor = dosisBase * cantidad;

    if (nota) advertencias.push(nota);
    if (totalProductoValor > 10000) {
      advertencias.push('Cantidad total muy elevada — verifica las unidades');
    }

    return {
      familia,
      totalProductoValor,
      totalProductoUnidad: unidadBase,
      cantidad,
      cantidadUnidad: 'm²',
      advertencias,
    };
  }

  // ── Familia m3 (fumigación) ───────────────────────────────────────────────
  if (familia === 'm3') {
    const { valor: dosisBase, unidad: unidadBase, nota } = normalizarNumerador(dosisValor, dosisUnidad);
    const totalProductoValor = dosisBase * cantidad;

    if (nota) advertencias.push(nota);

    return {
      familia,
      totalProductoValor,
      totalProductoUnidad: unidadBase,
      cantidad,
      cantidadUnidad: 'm³',
      advertencias,
    };
  }

  // ── Familia por kg ────────────────────────────────────────────────────────
  const { valor: dosisBase, unidad: unidadBase, nota } = normalizarNumerador(dosisValor, dosisUnidad);
  const totalProductoValor = dosisBase * cantidad;

  if (nota) advertencias.push(nota);

  return {
    familia,
    totalProductoValor,
    totalProductoUnidad: unidadBase,
    cantidad,
    cantidadUnidad: 'kg',
    advertencias,
  };
}
