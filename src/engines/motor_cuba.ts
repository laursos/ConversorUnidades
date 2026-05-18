import type { ResultadoCalculo } from '../types';
import { FACTOR_HL } from '../constants/units';
import { validarInputsCuba } from './motor_validacion';

function fmt(n: number): string {
  return parseFloat(n.toPrecision(10)).toLocaleString('es-ES', { maximumFractionDigits: 6 });
}

export function calcularCuba(
  dosis: number | null,
  unidadDosis: string,
  litrosCuba: number | null
): ResultadoCalculo {
  const validacion = validarInputsCuba(dosis, litrosCuba);
  if (!validacion.valido) {
    throw new Error(validacion.errores.join('. '));
  }

  const d = dosis as number;
  const lc = litrosCuba as number;

  const factorNorm = FACTOR_HL[unidadDosis] ?? 1;
  const dosisNorm = d * factorNorm;
  const hLCuba = lc / 100;
  const resultadoBruto = dosisNorm * hLCuba;

  const advertencias: string[] = [];

  // Determinar unidad del resultado y simplificar si aplica
  let valorFinal = resultadoBruto;
  let unidadFinal = '';

  const isG = unidadDosis.startsWith('g/');
  const isKg = unidadDosis.startsWith('kg/');
  const isMl = unidadDosis.startsWith('mL/') || unidadDosis.startsWith('cc/');
  const isL = unidadDosis.startsWith('L/');

  if (isG) {
    unidadFinal = 'g';
    if (resultadoBruto >= 1000) {
      valorFinal = resultadoBruto / 1000;
      unidadFinal = 'kg';
      advertencias.push(`Equivale a ${fmt(resultadoBruto)} g por cuba`);
    }
  } else if (isKg) {
    unidadFinal = 'kg';
  } else if (isMl) {
    unidadFinal = 'cc';
    if (resultadoBruto >= 1000) {
      valorFinal = resultadoBruto / 1000;
      unidadFinal = 'L';
      advertencias.push(`Equivale a ${fmt(resultadoBruto)} cc por cuba`);
    }
  } else if (isL) {
    unidadFinal = 'L';
  } else {
    unidadFinal = 'unidades';
  }

  return {
    valor: valorFinal,
    unidad: unidadFinal,
    formula: `${fmt(d)} × (${fmt(lc)} / 100)`,
    pasos: [
      `Dosis: ${fmt(d)} ${unidadDosis}`,
      `Volumen cuba: ${fmt(lc)} L`,
      `Convertir a hL: ${fmt(lc)} / 100 = ${fmt(hLCuba)} hL`,
      factorNorm !== 1
        ? `Normalizar unidad (×${factorNorm}): ${fmt(d)} × ${factorNorm} = ${fmt(dosisNorm)}`
        : `Factor normalización: 1`,
      `Producto por cuba: ${fmt(dosisNorm)} × ${fmt(hLCuba)} = ${fmt(resultadoBruto)}`,
      valorFinal !== resultadoBruto
        ? `Simplificado: ${fmt(valorFinal)} ${unidadFinal}`
        : `Resultado: ${fmt(valorFinal)} ${unidadFinal}`,
    ],
    advertencias,
  };
}
