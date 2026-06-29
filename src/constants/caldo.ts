export type TipoCultivo = 'olivo' | 'citrico' | 'granado' | 'higuera' | 'hortaliza';
export type TipoPlaga = 'exterior' | 'interior';

export interface RangoCaldo {
  min: number;
  max: number;
  nota: string;
}

export interface CultivoInfo {
  id: TipoCultivo;
  label: string;
  emoji: string;
}

export const CULTIVOS: CultivoInfo[] = [
  { id: 'olivo',     label: 'Olivo',      emoji: '🫒' },
  { id: 'citrico',   label: 'Cítrico',    emoji: '🍊' },
  { id: 'granado',   label: 'Granado',    emoji: '🌺' },
  { id: 'higuera',   label: 'Higuera',    emoji: '🌿' },
  { id: 'hortaliza', label: 'Hortaliza',  emoji: '🥬' },
];

export const TIPOS_PLAGA: { id: TipoPlaga; label: string; desc: string }[] = [
  { id: 'exterior', label: 'Exterior',       desc: 'Insectos, ácaros, mosca' },
  { id: 'interior', label: 'Interior/Hongo', desc: 'Hongos, bacterias, sistémico' },
];

// Volumen de caldo recomendado (L/ha) según cultivo y tipo de tratamiento.
// Basado en guías fitosanitarias estándar para aplicaciones en España.
export const CALDO_RECOMENDADO: Record<TipoCultivo, Record<TipoPlaga, RangoCaldo>> = {
  olivo: {
    exterior: { min: 500,  max: 800,  nota: 'Prays, mosca del olivo, cochinilla' },
    interior: { min: 600,  max: 1000, nota: 'Repilo, antracnosis, verticiliosis' },
  },
  citrico: {
    exterior: { min: 1500, max: 2500, nota: 'Cochinillas, araña roja, mosca blanca' },
    interior: { min: 2000, max: 3000, nota: 'Gomosis, alternaria, fumagina' },
  },
  granado: {
    exterior: { min: 600,  max: 1000, nota: 'Pulgón, barrenador, trips' },
    interior: { min: 800,  max: 1200, nota: 'Botrytis, oidiosis' },
  },
  higuera: {
    exterior: { min: 500,  max: 800,  nota: 'Cochinillas, acarosis' },
    interior: { min: 700,  max: 1000, nota: 'Botrytis, antracnosis' },
  },
  hortaliza: {
    exterior: { min: 400,  max: 600,  nota: 'Plagas al aire libre' },
    interior: { min: 200,  max: 400,  nota: 'Tratamiento en invernadero' },
  },
};

export function caldoMedio(rango: RangoCaldo): number {
  return Math.round((rango.min + rango.max) / 2);
}
