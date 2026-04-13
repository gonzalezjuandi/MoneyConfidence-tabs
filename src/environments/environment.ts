/**
 * Rama `v2`: desarrollo local = experiencia V2 por defecto (login directo, sin modal).
 * Misma lógica que `environment.v2.ts`; builds `npm run build:v2` siguen usando fileReplacements.
 */
export const environment = {
  production: false,
  experience: 'v2' as const,
  entryFromLogin: true,
  skipPostLoginSpendingModal: true
};
