import type { ResultadoCalculo } from '../types';
import { validarEntradaPositiva } from './motor_validacion';

function fmt(n: number): string {
  return parseFloat(n.toPrecision(10)).toLocaleString('es-ES', { maximumFractionDigits: 6 });
}

export function convertirConcentracion(
  valor: number | null,
  unidadOrigen: string
): ResultadoCalculo {
  const errores = validarEntradaPositiva(valor, 'Valor');
  if (errores.length > 0) {
    throw new Error(errores.join('. '));
  }

  const v = valor as number;

  // mg/L ↔ ppm is 1:1 for aqueous solutions
  if (unidadOrigen === 'mg/L') {
    return {
      valor: v,
      unidad: 'ppm',
      formula: `${fmt(v)} mg/L = ${fmt(v)} ppm`,
      pasos: [
        `Valor: ${fmt(v)} mg/L`,
        `En soluciones acuosas: 1 mg/L ≈ 1 ppm`,
        `Resultado: ${fmt(v)} ppm`,
      ],
      advertencias: [
        'Equivalencia 1:1 válida solo para soluciones acuosas (densidad ≈ 1 kg/L)',
      ],
    };
  }

  if (unidadOrigen === 'ppm') {
    return {
      valor: v,
      unidad: 'mg/L',
      formula: `${fmt(v)} ppm = ${fmt(v)} mg/L`,
      pasos: [
        `Valor: ${fmt(v)} ppm`,
        `En soluciones acuosas: 1 ppm ≈ 1 mg/L`,
        `Resultado: ${fmt(v)} mg/L`,
      ],
      advertencias: [
        'Equivalencia 1:1 válida solo para soluciones acuosas (densidad ≈ 1 kg/L)',
      ],
    };
  }

  throw new Error(`Unidad de concentración no soportada: ${unidadOrigen}`);
}
