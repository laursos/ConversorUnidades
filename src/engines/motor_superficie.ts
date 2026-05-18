import type { ResultadoCalculo } from '../types';
import { validarInputsSuperficie } from './motor_validacion';

function fmt(n: number): string {
  return parseFloat(n.toPrecision(10)).toLocaleString('es-ES', { maximumFractionDigits: 6 });
}

function extraerUnidadBase(unidadDosis: string): string {
  return unidadDosis.replace('/ha', '').replace('/m²', '').replace('/m³', '');
}

export function calcularSuperficie(
  dosis: number | null,
  unidadDosis: string,
  superficie: number | null
): ResultadoCalculo {
  const validacion = validarInputsSuperficie(dosis, superficie);
  if (!validacion.valido) {
    throw new Error(validacion.errores.join('. '));
  }

  const d = dosis as number;
  const s = superficie as number;
  const resultado = d * s;
  const unidadBase = extraerUnidadBase(unidadDosis);

  const advertencias: string[] = [];
  if (resultado > 100000) {
    advertencias.push('Resultado muy elevado — verifica las unidades y la superficie');
  }

  return {
    valor: resultado,
    unidad: unidadBase,
    formula: `${fmt(d)} ${unidadDosis} × ${fmt(s)} ha`,
    pasos: [
      `Dosis: ${fmt(d)} ${unidadDosis}`,
      `Superficie: ${fmt(s)} ha`,
      `Total = dosis × superficie`,
      `Total = ${fmt(d)} × ${fmt(s)} = ${fmt(resultado)} ${unidadBase}`,
    ],
    advertencias,
  };
}
