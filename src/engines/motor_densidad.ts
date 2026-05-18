import type { ResultadoCalculo } from '../types';
import { validarInputsDensidad } from './motor_validacion';

function fmt(n: number): string {
  return parseFloat(n.toPrecision(10)).toLocaleString('es-ES', { maximumFractionDigits: 6 });
}

export function convertirDensidad(
  valor: number | null,
  unidadOrigen: 'L' | 'kg',
  densidad: number | null
): ResultadoCalculo {
  const validacion = validarInputsDensidad(valor, densidad);
  if (!validacion.valido) {
    throw new Error(validacion.errores.join('. '));
  }

  const v = valor as number;
  const d = densidad as number;

  if (unidadOrigen === 'L') {
    const resultado = v * d;
    return {
      valor: resultado,
      unidad: 'kg',
      formula: `${fmt(v)} L × ${fmt(d)} kg/L`,
      pasos: [
        `Volumen: ${fmt(v)} L`,
        `Densidad: ${fmt(d)} kg/L`,
        `kg = L × densidad`,
        `Resultado: ${fmt(v)} × ${fmt(d)} = ${fmt(resultado)} kg`,
      ],
      advertencias: [],
    };
  } else {
    const resultado = v / d;
    return {
      valor: resultado,
      unidad: 'L',
      formula: `${fmt(v)} kg ÷ ${fmt(d)} kg/L`,
      pasos: [
        `Peso: ${fmt(v)} kg`,
        `Densidad: ${fmt(d)} kg/L`,
        `L = kg ÷ densidad`,
        `Resultado: ${fmt(v)} ÷ ${fmt(d)} = ${fmt(resultado)} L`,
      ],
      advertencias: [],
    };
  }
}
