export type TemaPreferencia = 'sistema' | 'claro' | 'oscuro' | 'extra';

const TEMAS_VALIDOS: TemaPreferencia[] = ['sistema', 'claro', 'oscuro', 'extra'];

/** Alinea el valor del API con los temas que entiende la app */
export function normalizarTema(tema?: string): TemaPreferencia {
  if (tema && TEMAS_VALIDOS.includes(tema as TemaPreferencia)) {
    return tema as TemaPreferencia;
  }
  return 'sistema';
}

export interface ConfiguracionApp {
  tema?: TemaPreferencia;
  tamano_letra?: string;
  alto_contraste?: boolean;
  notificaciones?: boolean;
}

const STORAGE_KEY = 'nexo_config_cache';

let mediaQuery: MediaQueryList | null = null;
let onSystemThemeChange: ((e: MediaQueryListEvent) => void) | null = null;

function guardarCacheLocal(config: ConfiguracionApp) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      tema: config.tema ?? 'sistema',
      tamano_letra: config.tamano_letra ?? 'normal',
      alto_contraste: Boolean(config.alto_contraste),
    })
  );
}

function leerCacheLocal(): ConfiguracionApp | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function esModoOscuro(tema: TemaPreferencia): boolean {
  if (tema === 'extra') return false;
  if (tema === 'oscuro') return true;
  if (tema === 'claro') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function aplicarPaletaIonic(oscuro: boolean) {
  document.documentElement.classList.toggle('ion-palette-dark', oscuro);
}

function quitarListenerSistema() {
  if (mediaQuery && onSystemThemeChange) {
    mediaQuery.removeEventListener('change', onSystemThemeChange);
  }
  mediaQuery = null;
  onSystemThemeChange = null;
}

function configurarListenerSistema() {
  quitarListenerSistema();
  mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  onSystemThemeChange = () => {
    if (document.body.classList.contains('tema-sistema')) {
      aplicarPaletaIonic(mediaQuery!.matches);
    }
  };
  mediaQuery.addEventListener('change', onSystemThemeChange);
}

export const aplicarConfiguracion = (config: ConfiguracionApp) => {
  const tema = normalizarTema(config.tema);
  const tamanoLetra = config.tamano_letra || 'normal';
  const altoContraste = Boolean(config.alto_contraste);

  guardarCacheLocal(config);

  document.body.classList.remove(
    'tema-sistema',
    'tema-claro',
    'tema-oscuro',
    'tema-extra',
    'texto-normal',
    'texto-grande',
    'texto-muy-grande',
    'alto-contraste'
  );

  if (tema === 'sistema') {
    document.body.classList.add('tema-sistema');
    configurarListenerSistema();
  } else {
    quitarListenerSistema();
    if (tema === 'claro') document.body.classList.add('tema-claro');
    else if (tema === 'oscuro') document.body.classList.add('tema-oscuro');
    else if (tema === 'extra') document.body.classList.add('tema-extra');
  }

  document.body.classList.add(`texto-${tamanoLetra}`);

  if (altoContraste) {
    document.body.classList.add('alto-contraste');
  }

  aplicarPaletaIonic(esModoOscuro(tema));
};

/** Aplica tema desde caché local (login, registro, arranque sin API). */
export const initTemaLocal = () => {
  const cache = leerCacheLocal();
  aplicarConfiguracion(
    cache ?? { tema: 'sistema', tamano_letra: 'normal', alto_contraste: false }
  );
};

export const cargarConfiguracion = async () => {
  const token = localStorage.getItem('token');

  if (!token) {
    initTemaLocal();
    return;
  }

  try {
    const res = await fetch('https://backend-nexo.onrender.com/config', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      initTemaLocal();
      return;
    }

    const config = await res.json();
    aplicarConfiguracion({
      tema: normalizarTema(config.tema),
      tamano_letra: config.tamano_letra,
      alto_contraste: config.alto_contraste,
      notificaciones: config.notificaciones,
    });
  } catch (error) {
    console.error(error);
    initTemaLocal();
  }
};
