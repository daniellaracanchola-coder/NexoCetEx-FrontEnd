/** Respaldo local cuando el backend o la BD no responden (solo lectura). */

const PREFIJO = 'nexo_cache_';

export interface EntradaCache<T> {
  data: T;
  savedAt: string;
}

export interface ResultadoConCache<T> {
  data: T;
  desdeCache: boolean;
  fechaCache?: string;
}

export const clavesCache = {
  avisos: () => `${PREFIJO}avisos`,
  chats: (usuarioId: number) => `${PREFIJO}chats_${usuarioId}`,
  mensajesChat: (chatId: string | number) => `${PREFIJO}mensajes_${chatId}`,
  integrantesChat: (chatId: string | number) => `${PREFIJO}integrantes_${chatId}`,
  dudas: () => `${PREFIJO}dudas`,
  adminPendientes: () => `${PREFIJO}admin_pendientes`,
  adminUsuarios: () => `${PREFIJO}admin_usuarios`,
};

export function guardarEnCache<T>(clave: string, data: T): void {
  try {
    const entrada: EntradaCache<T> = {
      data,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(clave, JSON.stringify(entrada));
  } catch (error) {
    console.warn('No se pudo guardar caché local:', error);
  }
}

export function leerDeCache<T>(clave: string): EntradaCache<T> | null {
  try {
    const raw = localStorage.getItem(clave);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as EntradaCache<T>;
    if (!parsed?.data) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function formatearFechaRespaldo(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

/**
 * Intenta obtener datos en línea; si falla, devuelve el último respaldo guardado.
 */
export async function obtenerConCache<T>(
  clave: string,
  obtenerEnLinea: () => Promise<T>
): Promise<ResultadoConCache<T>> {
  try {
    const data = await obtenerEnLinea();
    guardarEnCache(clave, data);
    return { data, desdeCache: false };
  } catch (error) {
    const respaldo = leerDeCache<T>(clave);
    if (respaldo) {
      return {
        data: respaldo.data,
        desdeCache: true,
        fechaCache: respaldo.savedAt,
      };
    }
    throw error;
  }
}

export async function fetchJsonConAuth<T>(
  url: string,
  token: string | null
): Promise<T> {
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}
