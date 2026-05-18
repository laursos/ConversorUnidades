import type { ValidacionResult } from '../types';
import { UNIT_GROUP_MAP } from '../constants/units';

export function validarEntradaPositiva(valor: number | null, nombre: string): string[] {
  const errores: string[] = [];
  if (valor === null || valor === undefined || isNaN(valor as number)) {
    errores.push(`${nombre} es requerido`);
  } else if ((valor as number) <= 0) {
    errores.push(`${nombre} debe ser mayor que 0`);
  }
  return errores;
}

export function validarDensidad(densidad: number | null): string[] {
  if (densidad === null || densidad === undefined || isNaN(densidad as number)) {
    return ['Densidad requerida para esta conversión (kg/L)'];
  }
  if ((densidad as number) <= 0) {
    return ['La densidad debe ser mayor que 0'];
  }
  return [];
}

export function validarHoras(horas: number | null): string[] {
  if (horas === null || horas === undefined || isNaN(horas as number)) {
    return ['Horas de funcionamiento requeridas para calcular kWh'];
  }
  if ((horas as number) <= 0) {
    return ['Las horas deben ser mayores que 0'];
  }
  return [];
}

export function validarVolCaldo(volCaldo: number | null): string[] {
  if (volCaldo === null || volCaldo === undefined || isNaN(volCaldo as number)) {
    return ['Volumen de caldo (L/ha) requerido'];
  }
  if ((volCaldo as number) <= 0) {
    return ['El volumen de caldo debe ser mayor que 0'];
  }
  return [];
}

export function validarSuperficie(superficie: number | null): string[] {
  if (superficie === null || superficie === undefined || isNaN(superficie as number)) {
    return ['Superficie requerida'];
  }
  if ((superficie as number) <= 0) {
    return ['La superficie debe ser mayor que 0'];
  }
  return [];
}

export function validarLitrosCuba(litros: number | null): string[] {
  if (litros === null || litros === undefined || isNaN(litros as number)) {
    return ['Capacidad de cuba requerida (L)'];
  }
  if ((litros as number) <= 0) {
    return ['La capacidad de cuba debe ser mayor que 0'];
  }
  return [];
}

export function validarCompatibilidadUnidades(origen: string, destino: string): string[] {
  if (origen === destino) {
    return ['Las unidades de origen y destino son iguales'];
  }
  const grupoOrigen = UNIT_GROUP_MAP[origen];
  const grupoDestino = UNIT_GROUP_MAP[destino];
  if (grupoOrigen && grupoDestino && grupoOrigen !== grupoDestino) {
    return [`Las unidades "${origen}" y "${destino}" no son compatibles`];
  }
  return [];
}

export function validarInputsDensidad(
  valor: number | null,
  densidad: number | null
): ValidacionResult {
  const errores = [
    ...validarEntradaPositiva(valor, 'Valor'),
    ...validarDensidad(densidad),
  ];
  return { valido: errores.length === 0, errores };
}

export function validarInputsHL(
  dosis: number | null,
  volCaldo: number | null
): ValidacionResult {
  const errores = [
    ...validarEntradaPositiva(dosis, 'Dosis'),
    ...validarVolCaldo(volCaldo),
  ];
  return { valido: errores.length === 0, errores };
}

export function validarInputsEnergia(
  valor: number | null,
  unidadDestino: string,
  horas: number | null
): ValidacionResult {
  const errores = [...validarEntradaPositiva(valor, 'Valor')];
  if (unidadDestino === 'kWh') {
    errores.push(...validarHoras(horas));
  }
  return { valido: errores.length === 0, errores };
}

export function validarInputsCuba(
  dosis: number | null,
  litrosCuba: number | null
): ValidacionResult {
  const errores = [
    ...validarEntradaPositiva(dosis, 'Dosis'),
    ...validarLitrosCuba(litrosCuba),
  ];
  return { valido: errores.length === 0, errores };
}

export function validarInputsTrampas(
  dosis: number | null,
  superficie: number | null
): ValidacionResult {
  const errores = [
    ...validarEntradaPositiva(dosis, 'Dosis'),
    ...validarSuperficie(superficie),
  ];
  return { valido: errores.length === 0, errores };
}

export function validarInputsSuperficie(
  dosis: number | null,
  superficie: number | null
): ValidacionResult {
  const errores = [
    ...validarEntradaPositiva(dosis, 'Dosis'),
    ...validarSuperficie(superficie),
  ];
  return { valido: errores.length === 0, errores };
}

export function validarInputsConversion(
  valor: number | null,
  origen: string,
  destino: string
): ValidacionResult {
  const errores = [
    ...validarEntradaPositiva(valor, 'Valor'),
    ...validarCompatibilidadUnidades(origen, destino),
  ];
  return { valido: errores.length === 0, errores };
}
