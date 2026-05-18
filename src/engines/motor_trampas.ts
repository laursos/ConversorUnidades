import type { ResultadoCalculo } from '../types';
import { validarInputsTrampas } from './motor_validacion';

function fmt(n: number): string {
  return parseFloat(n.toPrecision(10)).toLocaleString('es-ES', { maximumFractionDigits: 6 });
}

function extraerUnidadBase(unidadDosis: string): string {
  return unidadDosis
    .replace('/ha', '')
    .replace('/m²', '')
    .replace('/m³', '')
    .replace('/m3', '');
}

export function calcularTrampas(
  dosis: number | null,
  unidadDosis: string,
  superficie: number | null,
  unidadSuperficie: string = 'ha'
): ResultadoCalculo {
  const validacion = validarInputsTrampas(dosis, superficie);
  if (!validacion.valido) {
    throw new Error(validacion.errores.join('. '));
  }

  const d = dosis as number;
  const s = superficie as number;
  const resultado = d * s;
  const unidadBase = extraerUnidadBase(unidadDosis);

  const labelSuperficie = unidadSuperficie === 'ha' ? 'ha'
    : unidadSuperficie === 'm2' ? 'm²'
    : unidadSuperficie === 'm3' ? 'm³'
    : unidadSuperficie;

  return {
    valor: resultado,
    unidad: unidadBase,
    formula: `${fmt(d)} × ${fmt(s)}`,
    pasos: [
      `Dosis: ${fmt(d)} ${unidadDosis}`,
      `Superficie/Volumen: ${fmt(s)} ${labelSuperficie}`,
      `Total = dosis × superficie`,
      `Total = ${fmt(d)} × ${fmt(s)} = ${fmt(resultado)} ${unidadBase}`,
    ],
    advertencias: [],
  };
}
