export interface ResultadoCalculo {
  valor: number;
  unidad: string;
  formula: string;
  pasos: string[];
  advertencias: string[];
}

export interface ValidacionResult {
  valido: boolean;
  errores: string[];
}

export interface InputsConversion {
  valor: number | null;
  unidadOrigen: string;
  unidadDestino: string;
}

export interface InputsDensidad {
  valor: number | null;
  unidadOrigen: 'L' | 'kg';
  densidad: number | null;
}

export interface InputsHL {
  dosis: number | null;
  unidadDosis: string;
  volCaldo: number | null;
}

export interface InputsCuba {
  dosis: number | null;
  unidadDosis: string;
  litrosCuba: number | null;
}

export interface InputsSuperficie {
  dosis: number | null;
  unidadDosis: string;
  superficie: number | null;
}

export interface InputsEnergia {
  valor: number | null;
  unidadOrigen: string;
  unidadDestino: string;
  horas: number | null;
}

export interface InputsConcentracion {
  valor: number | null;
  unidadOrigen: string;
}

export interface InputsTrampas {
  dosis: number | null;
  unidadDosis: string;
  superficie: number | null;
}

export type UnitGroup =
  | 'superficie'
  | 'volumen'
  | 'peso'
  | 'longitud'
  | 'dosis_ha'
  | 'dosis_hl'
  | 'biologicos'
  | 'feromonas'
  | 'energia'
  | 'concentracion'
  | 'otras';
