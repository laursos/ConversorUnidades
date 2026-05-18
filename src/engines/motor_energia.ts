import type { ResultadoCalculo } from '../types';
import { validarInputsEnergia } from './motor_validacion';

const CV_TO_KW = 0.7355;

function fmt(n: number): string {
  return parseFloat(n.toPrecision(8)).toLocaleString('es-ES', { maximumFractionDigits: 4 });
}

export function convertirEnergia(
  valor: number | null,
  unidadOrigen: string,
  unidadDestino: string,
  horas: number | null
): ResultadoCalculo {
  const validacion = validarInputsEnergia(valor, unidadDestino, horas);
  if (!validacion.valido) {
    throw new Error(validacion.errores.join('. '));
  }

  const v = valor as number;

  // CV → kW
  if (unidadOrigen === 'CV' && unidadDestino === 'kW') {
    const resultado = v * CV_TO_KW;
    return {
      valor: resultado,
      unidad: 'kW',
      formula: `${fmt(v)} × ${CV_TO_KW}`,
      pasos: [
        `Potencia: ${fmt(v)} CV`,
        `Factor de conversión: 1 CV = ${CV_TO_KW} kW`,
        `Resultado: ${fmt(v)} × ${CV_TO_KW} = ${fmt(resultado)} kW`,
      ],
      advertencias: [],
    };
  }

  // kW → CV
  if (unidadOrigen === 'kW' && unidadDestino === 'CV') {
    const resultado = v / CV_TO_KW;
    return {
      valor: resultado,
      unidad: 'CV',
      formula: `${fmt(v)} / ${CV_TO_KW}`,
      pasos: [
        `Potencia: ${fmt(v)} kW`,
        `Factor de conversión: 1 kW = ${fmt(1 / CV_TO_KW)} CV`,
        `Resultado: ${fmt(v)} / ${CV_TO_KW} = ${fmt(resultado)} CV`,
      ],
      advertencias: [],
    };
  }

  // kW → kWh
  if (unidadOrigen === 'kW' && unidadDestino === 'kWh') {
    const h = horas as number;
    const resultado = v * h;
    return {
      valor: resultado,
      unidad: 'kWh',
      formula: `${fmt(v)} kW × ${fmt(h)} h`,
      pasos: [
        `Potencia: ${fmt(v)} kW`,
        `Tiempo: ${fmt(h)} horas`,
        `Energía = Potencia × Tiempo`,
        `Resultado: ${fmt(v)} × ${fmt(h)} = ${fmt(resultado)} kWh`,
      ],
      advertencias: [],
    };
  }

  // CV → kWh
  if (unidadOrigen === 'CV' && unidadDestino === 'kWh') {
    const h = horas as number;
    const kw = v * CV_TO_KW;
    const resultado = kw * h;
    return {
      valor: resultado,
      unidad: 'kWh',
      formula: `(${fmt(v)} × ${CV_TO_KW}) × ${fmt(h)}`,
      pasos: [
        `Potencia: ${fmt(v)} CV`,
        `Convertir a kW: ${fmt(v)} × ${CV_TO_KW} = ${fmt(kw)} kW`,
        `Tiempo: ${fmt(h)} horas`,
        `Energía = ${fmt(kw)} × ${fmt(h)} = ${fmt(resultado)} kWh`,
      ],
      advertencias: [],
    };
  }

  // kWh → kW (requiere horas)
  if (unidadOrigen === 'kWh' && unidadDestino === 'kW') {
    const h = horas as number;
    const resultado = v / h;
    return {
      valor: resultado,
      unidad: 'kW',
      formula: `${fmt(v)} kWh / ${fmt(h)} h`,
      pasos: [
        `Energía: ${fmt(v)} kWh`,
        `Tiempo: ${fmt(h)} horas`,
        `Potencia = Energía / Tiempo`,
        `Resultado: ${fmt(v)} / ${fmt(h)} = ${fmt(resultado)} kW`,
      ],
      advertencias: [],
    };
  }

  throw new Error(`Conversión ${unidadOrigen} → ${unidadDestino} no soportada`);
}
