import type { ResultadoCalculo } from '../types';
import { FACTOR_HL } from '../constants/units';
import { validarInputsHL } from './motor_validacion';

function fmt(n: number): string {
  return parseFloat(n.toPrecision(10)).toLocaleString('es-ES', { maximumFractionDigits: 6 });
}

function getUnidadResultado(unidadDosis: string): string {
  if (unidadDosis.startsWith('kg') || unidadDosis.startsWith('g') || unidadDosis.startsWith('t')) {
    const base = unidadDosis.startsWith('kg') ? 'kg' : unidadDosis.startsWith('g') ? 'g' : 't';
    return `${base}/ha`;
  }
  if (unidadDosis.startsWith('L') || unidadDosis.startsWith('mL') || unidadDosis.startsWith('cc')) {
    const base = unidadDosis.startsWith('mL') ? 'mL' : unidadDosis.startsWith('cc') ? 'cc' : 'L';
    return `${base}/ha`;
  }
  return 'unidades/ha';
}

export function convertirHL(
  dosis: number | null,
  unidadDosis: string,
  volCaldo: number | null
): ResultadoCalculo {
  const validacion = validarInputsHL(dosis, volCaldo);
  if (!validacion.valido) {
    throw new Error(validacion.errores.join('. '));
  }

  const d = dosis as number;
  const vc = volCaldo as number;

  const factorNorm = FACTOR_HL[unidadDosis] ?? 1;
  const dosisNorm = d * factorNorm; // en L/hL o kg/hL
  const hLporHa = vc / 100;
  const resultado = dosisNorm * hLporHa;

  const unidadResultado = getUnidadResultado(unidadDosis);

  const advertencias: string[] = [];
  if (resultado > 10000) {
    advertencias.push('Resultado muy elevado — verifica las unidades');
  }

  // Auto-simplificar cc o mL a L, g a kg si el resultado es grande
  let valorMostrar = resultado;
  let unidadMostrar = unidadResultado;
  if ((unidadResultado === 'cc/ha' || unidadResultado === 'mL/ha') && resultado >= 1000) {
    valorMostrar = resultado / 1000;
    unidadMostrar = 'L/ha';
    advertencias.push(`Valor equivalente: ${fmt(resultado)} ${unidadResultado}`);
  } else if (unidadResultado === 'g/ha' && resultado >= 1000) {
    valorMostrar = resultado / 1000;
    unidadMostrar = 'kg/ha';
    advertencias.push(`Valor equivalente: ${fmt(resultado)} ${unidadResultado}`);
  }

  return {
    valor: valorMostrar,
    unidad: unidadMostrar,
    formula: `${fmt(d)} × (${fmt(vc)} / 100)`,
    pasos: [
      `Dosis: ${fmt(d)} ${unidadDosis}`,
      `Volumen de caldo: ${fmt(vc)} L/ha`,
      `Convertir a hL/ha: ${fmt(vc)} / 100 = ${fmt(hLporHa)} hL/ha`,
      factorNorm !== 1
        ? `Normalizar unidad (×${factorNorm}): ${fmt(d)} × ${factorNorm} = ${fmt(dosisNorm)}`
        : `Factor normalización: 1 (sin ajuste)`,
      `Dosis/ha = ${fmt(dosisNorm)} × ${fmt(hLporHa)} = ${fmt(resultado)} ${unidadResultado}`,
    ],
    advertencias,
  };
}
