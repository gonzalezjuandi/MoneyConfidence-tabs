export interface FinalidadOption {
  value: string;
  label: string;
}

/** Opciones de finalidad (referencia diseño Simulación Préstamo) */
export const PRESTAMO_SABADELL_FINALIDADES: FinalidadOption[] = [
  { value: 'reformas', label: 'Reformas' },
  { value: 'coche', label: 'Coche' },
  { value: 'salud', label: 'Salud' },
  { value: 'estudios', label: 'Estudios' },
  { value: 'viaje', label: 'Viaje' },
  { value: 'otros', label: 'Otros' }
];

export interface CotitularOption {
  id: string;
  nombre: string;
}

/** Cotitulares demo (cuenta compartida) */
export const PRESTAMO_SABADELL_COTITULARES_DEMO: CotitularOption[] = [
  { id: 'macarena-martinez', nombre: 'Macarena Martínez García' },
  { id: 'manolo-garcia', nombre: 'Manolo García Cardenal' }
];
