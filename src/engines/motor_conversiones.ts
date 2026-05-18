import type { ResultadoCalculo } from '../types';
import { BASE_VALUES, POOL_BASICAS, UNIT_GROUP_MAP } from '../constants/units';
import { validarInputsConversion } from './motor_validacion';

function formatNum(n: number): string {
  const rounded = parseFloat(n.toPrecision(10));
  return rounded.toLocaleString('es-ES', { maximumFractionDigits: 6 });
}

export function convertirBasico(
  valor: number | null,
  unidadOrigen: string,
  unidadDestino: string
): ResultadoCalculo {
  const validacion = validarInputsConversion(valor, unidadOrigen, unidadDestino);
  if (!validacion.valido) {
    throw new Error(validacion.errores.join('. '));
  }

  const v = valor as number;
  const baseOrigen = BASE_VALUES[unidadOrigen];
  const baseDestino = BASE_VALUES[unidadDestino];

  if (baseOrigen === undefined || baseDestino === undefined) {
    // Dosis por hectárea — misma dimensión, factor directo
    return convertirDosisDirect(v, unidadOrigen, unidadDestino);
  }

  const resultado = v * baseOrigen / baseDestino;

  const labelOrigen = POOL_BASICAS.find(u => u.id === unidadOrigen)?.label ?? unidadOrigen;
  const labelDestino = POOL_BASICAS.find(u => u.id === unidadDestino)?.label ?? unidadDestino;

  return {
    valor: resultado,
    unidad: labelDestino,
    formula: `${formatNum(v)} × (${baseOrigen} / ${baseDestino})`,
    pasos: [
      `Valor origen: ${formatNum(v)} ${labelOrigen}`,
      `Factor base ${labelOrigen}: ${baseOrigen}`,
      `Factor base ${labelDestino}: ${baseDestino}`,
      `Resultado: ${formatNum(v)} × ${baseOrigen} / ${baseDestino} = ${formatNum(resultado)} ${labelDestino}`,
    ],
    advertencias: [],
  };
}

// Dosis por hectárea entre unidades compatibles (ej: kg/ha ↔ g/ha, L/ha ↔ mL/ha)
function convertirDosisDirect(
  valor: number,
  unidadOrigen: string,
  unidadDestino: string
): ResultadoCalculo {
  // Extraer unidad base y aplicar factor de peso o volumen
  const factores: Record<string, number> = {
    'kg/ha': 1, 'g/ha': 1000, 't/ha': 0.001,
    'L/ha': 1, 'mL/ha': 1000, 'cc/ha': 1000, 'm³/ha': 0.001,
  };

  const fOrigen = factores[unidadOrigen];
  const fDestino = factores[unidadDestino];

  if (fOrigen === undefined || fDestino === undefined) {
    throw new Error(`Conversión no soportada: ${unidadOrigen} → ${unidadDestino}`);
  }

  // Check same dimension (weight vs volume)
  const pesoUnits = ['kg/ha', 'g/ha', 't/ha'];
  const origenEsPeso = pesoUnits.includes(unidadOrigen);
  const destinoEsPeso = pesoUnits.includes(unidadDestino);
  if (origenEsPeso !== destinoEsPeso) {
    throw new Error(`No se puede convertir ${unidadOrigen} a ${unidadDestino} sin densidad`);
  }

  // Convert to base then to destination
  const baseValue = valor / fOrigen; // base unit per ha (kg/ha or L/ha)
  const resultado = baseValue * fDestino;

  return {
    valor: resultado,
    unidad: unidadDestino,
    formula: `${formatNum(valor)} ÷ ${fOrigen} × ${fDestino}`,
    pasos: [
      `Valor origen: ${formatNum(valor)} ${unidadOrigen}`,
      `Convertir a unidad base: ${formatNum(valor)} ÷ ${fOrigen} = ${formatNum(baseValue)}`,
      `Convertir a destino: ${formatNum(baseValue)} × ${fDestino} = ${formatNum(resultado)} ${unidadDestino}`,
    ],
    advertencias: [],
  };
}

export function getCompatibleUnits(unidadOrigen: string): string[] {
  const grupoOrigen = UNIT_GROUP_MAP[unidadOrigen];
  if (!grupoOrigen) return [];
  return POOL_BASICAS
    .filter(u => u.group === grupoOrigen && u.id !== unidadOrigen)
    .map(u => u.id);
}
