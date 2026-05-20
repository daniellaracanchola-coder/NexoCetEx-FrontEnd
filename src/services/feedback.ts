import { toastController, alertController } from '@ionic/vue';
import type { Router } from 'vue-router';

type ToastColor = 'success' | 'danger' | 'warning' | 'primary';

/**
 * Toast breve para confirmar acciones (mensaje enviado, guardado, etc.).
 */
export async function mostrarToast(
  mensaje: string,
  color: ToastColor = 'success',
  duracionMs = 2800
) {
  const toast = await toastController.create({
    message: mensaje,
    duration: duracionMs,
    position: 'bottom',
    color,
  });
  await toast.present();
}

/**
 * Alerta modal con un solo botón (mensajes importantes).
 */
export async function mostrarAlerta(
  header: string,
  message: string,
  textoBoton = 'Aceptar'
) {
  const alert = await alertController.create({
    header,
    message,
    buttons: [textoBoton],
  });
  await alert.present();
}

/**
 * Tras registro exitoso: aviso de espera de autorización e ir al login.
 */
export async function mostrarRegistroEnviado(router: Router, mensajeServidor?: string) {
  const detalle =
    mensajeServidor?.trim() ||
    'Tu solicitud quedó registrada en el sistema.';
  const alert = await alertController.create({
    header: 'Registro enviado',
    message: `${detalle}\n\nUn administrador debe autorizar tu cuenta antes de que puedas iniciar sesión. Espera la aprobación; si no ves cambios en unos días, contacta a la escuela.`,
    buttons: [
      {
        text: 'Ir a iniciar sesión',
        handler: () => {
          void router.push('/login');
        },
      },
    ],
  });
  await alert.present();
}
