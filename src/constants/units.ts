import type { UnitGroup } from '../types';

export interface UnitDef {
  id: string;
  label: string;
  group: UnitGroup;
}

// SI base value for basic unit conversion (multiply to get base, divide by target base to get result)
export const BASE_VALUES: Record<string, number> = {
  // Superficie (base: m²)
  m2: 1,
  ha: 10000,
  // Volumen (base: m³)
  m3: 1,
  L: 0.001,
  mL: 0.000001,
  cc: 0.000001,
  // Peso (base: kg)
  g: 0.001,
  kg: 1,
  t: 1000,
  // Longitud (base: m)
  cm: 0.01,
  m: 1,
  // Energía (base: kW)
  CV: 0.7355,
  kW: 1,
};

// Dosis/ha equivalencias (base: kg/ha)
export const BASE_DOSIS_HA: Record<string, number> = {
  'kg/ha': 1,
  'g/ha': 0.001,
  'L/ha': 1,
  'mL/ha': 0.001,
  'cc/ha': 0.001,
  'm³/ha': 1000,
  't/ha': 1000,
};

// Dosis/hL equivalencias: factor para normalizar SOLO el denominador (/hL=1, /100L=1, /1000L=0.1)
// NO convierte el numerador (g, kg, L, mL, cc se mantienen tal cual)
export const FACTOR_HL: Record<string, number> = {
  'kg/hL': 1,
  'g/hL': 1,
  'L/hL': 1,
  'mL/hL': 1,
  'cc/hL': 1,
  'kg/100L': 1,
  'g/100L': 1,
  'L/100L': 1,
  'cc/100L': 1,
  'mL/100L': 1,
  'kg/1000L': 0.1,
  'g/1000L': 0.1,
  'L/1000L': 0.1,
  'cc/1000L': 0.1,
  'mL/1000L': 0.1,
};

// Unit group mapping
export const UNIT_GROUP_MAP: Record<string, UnitGroup> = {
  m2: 'superficie',
  ha: 'superficie',
  m3: 'volumen',
  L: 'volumen',
  mL: 'volumen',
  cc: 'volumen',
  g: 'peso',
  kg: 'peso',
  t: 'peso',
  cm: 'longitud',
  m: 'longitud',
  CV: 'energia',
  kW: 'energia',
  kWh: 'energia',
  '%': 'concentracion',
  'mg/L': 'concentracion',
  ppm: 'concentracion',
};

// Pool: unidades básicas para conversión simple
export const POOL_BASICAS: UnitDef[] = [
  { id: 'm2', label: 'm²', group: 'superficie' },
  { id: 'ha', label: 'ha', group: 'superficie' },
  { id: 'm3', label: 'm³', group: 'volumen' },
  { id: 'L', label: 'L', group: 'volumen' },
  { id: 'mL', label: 'mL', group: 'volumen' },
  { id: 'cc', label: 'cc', group: 'volumen' },
  { id: 'g', label: 'g', group: 'peso' },
  { id: 'kg', label: 'kg', group: 'peso' },
  { id: 't', label: 't', group: 'peso' },
  { id: 'cm', label: 'cm', group: 'longitud' },
  { id: 'm', label: 'm', group: 'longitud' },
];

// Pool: dosis por hectárea
export const POOL_DOSIS_HA: UnitDef[] = [
  { id: 'kg/ha', label: 'kg/ha', group: 'dosis_ha' },
  { id: 'g/ha', label: 'g/ha', group: 'dosis_ha' },
  { id: 'L/ha', label: 'L/ha', group: 'dosis_ha' },
  { id: 'mL/ha', label: 'mL/ha', group: 'dosis_ha' },
  { id: 'cc/ha', label: 'cc/ha', group: 'dosis_ha' },
  { id: 'm³/ha', label: 'm³/ha', group: 'dosis_ha' },
  { id: 't/ha', label: 't/ha', group: 'dosis_ha' },
];

// Pool: dosis por hectólitro (y equivalentes) + porcentaje
export const POOL_DOSIS_HL: UnitDef[] = [
  { id: 'L/hL',    label: 'L/hL',    group: 'dosis_hl' },
  { id: 'mL/hL',   label: 'mL/hL',   group: 'dosis_hl' },
  { id: 'cc/hL',   label: 'cc/hL',   group: 'dosis_hl' },
  { id: 'kg/hL',   label: 'kg/hL',   group: 'dosis_hl' },
  { id: 'g/hL',    label: 'g/hL',    group: 'dosis_hl' },
  { id: 'L/100L',  label: 'L/100L',  group: 'dosis_hl' },
  { id: 'mL/100L', label: 'mL/100L', group: 'dosis_hl' },
  { id: 'cc/100L', label: 'cc/100L', group: 'dosis_hl' },
  { id: 'kg/100L', label: 'kg/100L', group: 'dosis_hl' },
  { id: 'g/100L',  label: 'g/100L',  group: 'dosis_hl' },
  { id: 'L/1000L', label: 'L/1000L', group: 'dosis_hl' },
  { id: 'mL/1000L',label: 'mL/1000L',group: 'dosis_hl' },
  { id: 'cc/1000L',label: 'cc/1000L',group: 'dosis_hl' },
  { id: 'kg/1000L',label: 'kg/1000L',group: 'dosis_hl' },
  { id: 'g/1000L', label: 'g/1000L', group: 'dosis_hl' },
];

// Pool: concentración porcentual (% v/v) — equivale a L/hL en la mezcla
export const POOL_DOSIS_PCT: UnitDef[] = [
  { id: '%', label: '% (v/v)', group: 'otras' },
];

// Pool: dosis por metro cuadrado — tratamientos suelo e invernadero
export const POOL_DOSIS_M2: UnitDef[] = [
  { id: 'kg/m2', label: 'kg/m²', group: 'otras' },
  { id: 'g/m2',  label: 'g/m²',  group: 'otras' },
  { id: 'L/m2',  label: 'L/m²',  group: 'otras' },
  { id: 'mL/m2', label: 'mL/m²', group: 'otras' },
  { id: 'cc/m2', label: 'cc/m²', group: 'otras' },
];

// Pool: dosis por metro cúbico — fumigación en cámara o invernadero
export const POOL_DOSIS_M3: UnitDef[] = [
  { id: 'kg/m3', label: 'kg/m³', group: 'otras' },
  { id: 'g/m3',  label: 'g/m³',  group: 'otras' },
  { id: 'L/m3',  label: 'L/m³',  group: 'otras' },
  { id: 'mL/m3', label: 'mL/m³', group: 'otras' },
  { id: 'cc/m3', label: 'cc/m³', group: 'otras' },
  { id: 't/m3',  label: 't/m³',  group: 'otras' },
];

// Pool: dosis por kg de material tratado — semillas y sólidos
export const POOL_DOSIS_PORKG: UnitDef[] = [
  { id: 'mL/kg', label: 'mL/kg', group: 'otras' },
  { id: 'cc/kg', label: 'cc/kg', group: 'otras' },
  { id: 'L/kg',  label: 'L/kg',  group: 'otras' },
  { id: 'kg/kg', label: 'kg/kg', group: 'otras' },
  { id: 'g/kg',  label: 'g/kg',  group: 'otras' },
];

// Pool: unidades biológicas y feromonas
export const POOL_BIOLOGICOS: UnitDef[] = [
  { id: 'Individuos', label: 'Individuos', group: 'biologicos' },
  { id: 'Plantas', label: 'Plantas', group: 'biologicos' },
  { id: 'Unidades', label: 'Unidades', group: 'biologicos' },
  { id: 'uds./m²', label: 'uds./m²', group: 'biologicos' },
  { id: 'uds./ha', label: 'uds./ha', group: 'biologicos' },
];

export const POOL_FEROMONAS: UnitDef[] = [
  { id: 'Difusores/ha', label: 'Difusores/ha', group: 'feromonas' },
  { id: 'Difusores/m²', label: 'Difusores/m²', group: 'feromonas' },
  { id: 'Difusores/m³', label: 'Difusores/m³', group: 'feromonas' },
  { id: 'Tabletas/ha', label: 'Tabletas/ha', group: 'feromonas' },
  { id: 'Tabletas/m²', label: 'Tabletas/m²', group: 'feromonas' },
  { id: 'Tabletas/m³', label: 'Tabletas/m³', group: 'feromonas' },
  { id: 'Trampas/ha', label: 'Trampas/ha', group: 'feromonas' },
  { id: 'Trampas/m²', label: 'Trampas/m²', group: 'feromonas' },
  { id: 'Trampas/m³', label: 'Trampas/m³', group: 'feromonas' },
];

// Pool: energía
export const POOL_ENERGIA: UnitDef[] = [
  { id: 'CV', label: 'CV', group: 'energia' },
  { id: 'kW', label: 'kW', group: 'energia' },
  { id: 'kWh', label: 'kWh', group: 'energia' },
];

// Pool: concentración
export const POOL_CONCENTRACION: UnitDef[] = [
  { id: 'mg/L', label: 'mg/L', group: 'concentracion' },
  { id: 'ppm', label: 'ppm', group: 'concentracion' },
];

// Unidades superficie para trampas/difusores
export const POOL_SUPERFICIE_TRAMPAS: UnitDef[] = [
  { id: 'ha', label: 'ha', group: 'superficie' },
  { id: 'm2', label: 'm²', group: 'superficie' },
  { id: 'm3', label: 'm³', group: 'volumen' },
];

// Extraer la unidad base de una unidad de dosis (quitar /ha, /m², /m³, /hL, etc.)
export function extraerUnidadBase(unidadDosis: string): string {
  return unidadDosis
    .replace('/ha', '')
    .replace('/m²', '')
    .replace('/m³', '')
    .replace('/m3', '')
    .replace('/hL', '')
    .replace('/100L', '')
    .replace('/1000L', '');
}

// Determinar si una unidad de dosis es de peso o volumen
export function esPeso(unidad: string): boolean {
  const base = extraerUnidadBase(unidad).toLowerCase();
  return base === 'kg' || base === 'g' || base === 't';
}

export function esVolumen(unidad: string): boolean {
  const base = extraerUnidadBase(unidad).toLowerCase();
  return base === 'l' || base === 'ml' || base === 'cc' || base === 'l';
}
