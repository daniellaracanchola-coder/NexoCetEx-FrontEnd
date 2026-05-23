import type { Router } from 'vue-router';
import { menuController } from '@ionic/vue';

const PENDIENTE_KEY = 'nexo_push_ruta_pendiente';

const RUTAS_VALIDAS = [
  '/home',
  '/grupos',
  '/nexo-a',
  '/config',
  '/admin',
  '/login',
];

let routerInstance: Router | null = null;

function normalizarRuta(ruta: string): string {
  const limpia = ruta.trim();
  if (!limpia.startsWith('/')) return '/home';

  if (RUTAS_VALIDAS.includes(limpia)) return limpia;

  if (/^\/chat\/\d+$/.test(limpia)) return limpia;

  return '/home';
}

export function extraerDatosNotificacion(notification: unknown): Record<string, string> {
  const n = notification as {
    data?: Record<string, string>;
    notification?: { data?: Record<string, string> };
  };

  return {
    ...(n?.data || {}),
    ...(n?.notification?.data || {}),
  };
}

export function registrarRouterPush(router: Router) {
  routerInstance = router;
}

export function guardarRutaPendiente(ruta: string) {
  sessionStorage.setItem(PENDIENTE_KEY, normalizarRuta(ruta));
}

export function consumirRutaPendiente(): string | null {
  const ruta = sessionStorage.getItem(PENDIENTE_KEY);
  if (!ruta) return null;
  sessionStorage.removeItem(PENDIENTE_KEY);
  return normalizarRuta(ruta);
}

export function resolverRutaTrasLogin(): string {
  const pendiente = consumirRutaPendiente();
  if (!pendiente || pendiente === '/login') return '/home';
  return pendiente;
}

export async function navegarDesdeNotificacion(
  datos: Record<string, string | undefined>
) {
  const ruta = normalizarRuta(datos.ruta || '/home');
  const token = localStorage.getItem('token');

  if (!token) {
    guardarRutaPendiente(ruta);
    if (routerInstance && routerInstance.currentRoute.value.path !== '/login') {
      await routerInstance.push('/login');
    }
    return;
  }

  await navegarARuta(ruta);
}

export async function procesarNavegacionPendiente() {
  const pendiente = consumirRutaPendiente();
  if (!pendiente || !localStorage.getItem('token')) return;
  await navegarARuta(pendiente);
}

async function navegarARuta(ruta: string) {
  const destino = normalizarRuta(ruta);

  if (!routerInstance) {
    guardarRutaPendiente(destino);
    return;
  }

  try {
    await menuController.close();
  } catch {
    /* menú no abierto */
  }

  if (destino === '/admin') {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    if (usuario?.rol !== 'admin') {
      await routerInstance.push('/home');
      return;
    }
  }

  if (routerInstance.currentRoute.value.path !== destino) {
    await routerInstance.push(destino);
  }
}
