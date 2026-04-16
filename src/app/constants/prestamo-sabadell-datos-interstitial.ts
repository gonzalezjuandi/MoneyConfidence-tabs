/**
 * Un mensaje por transición entre pantallas de datos (no se encadenan varios en el mismo salto).
 */
export interface SabadellDatosInterstitialSlide {
  title: string;
  bodyLines: string[];
}

export type DatosInterstitialTargetPhase = 'datos-familiares' | 'datos-vivienda' | 'datos-economicos';

export function getDatosInterstitialSlideForPhase(phase: DatosInterstitialTargetPhase): SabadellDatosInterstitialSlide {
  switch (phase) {
    case 'datos-familiares':
      return {
        title: 'Ya tenemos los primeros datos',
        bodyLines: ['Estamos preparando tu oferta personalizada.']
      };
    case 'datos-vivienda':
      return {
        title: 'Ya tenemos parte de tu perfil',
        bodyLines: ['Solo necesitamos un par de datos más sobre la vivienda.']
      };
    case 'datos-economicos':
      return {
        title: 'Calculando tu oferta personalizada',
        bodyLines: ['Preparamos el último bloque sobre tus ingresos.']
      };
  }
}
