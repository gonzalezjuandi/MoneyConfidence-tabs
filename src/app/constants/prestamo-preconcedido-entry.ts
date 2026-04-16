/**
 * Sesión: el usuario confirmó que no puede asumir el 40% (KO normativo).
 * Mientras esté activo, no debe mostrarse ningún entry point al préstamo preconcedido.
 */
export const PRECONCEDIDO_NORMATIVA_RECHAZADO_KEY = 'prestamo-preconcedido-normativa-rechazado';

export function isPreconcedidoEntryBlocked(): boolean {
  try {
    return (
      typeof sessionStorage !== 'undefined' &&
      sessionStorage.getItem(PRECONCEDIDO_NORMATIVA_RECHAZADO_KEY) === 'true'
    );
  } catch {
    return false;
  }
}

export function markPreconcedidoNormativaRechazado(): void {
  try {
    sessionStorage.setItem(PRECONCEDIDO_NORMATIVA_RECHAZADO_KEY, 'true');
  } catch {
    /* ignore */
  }
}
