import { PushNotifications } from '@capacitor/push-notifications';
import {
  extraerDatosNotificacion,
  navegarDesdeNotificacion,
} from '@/services/navegacionPush';

let listenersRegistrados = false;

function registrarListeners() {
  if (listenersRegistrados) return;
  listenersRegistrados = true;

  PushNotifications.addListener('registration', async (token) => {
    try {
      const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

      if (!usuario?.id) return;

      const respuesta = await fetch(
        'https://backend-nexo.onrender.com/api/usuarios/guardar-token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: usuario.id,
            token: token.value,
          }),
        }
      );

      if (!respuesta.ok) {
        console.error('Error al guardar token push:', respuesta.status);
      }
    } catch (error) {
      console.error('Error conectando al backend:', error);
    }
  });

  PushNotifications.addListener('registrationError', (error) => {
    console.error('Error al registrar push:', error);
  });

  PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
    const datos = extraerDatosNotificacion(action.notification);
    void navegarDesdeNotificacion(datos);
  });
}

export async function iniciarNotificacionesPush() {
  registrarListeners();

  let permStatus = await PushNotifications.checkPermissions();

  if (permStatus.receive === 'prompt') {
    permStatus = await PushNotifications.requestPermissions();
  }

  if (permStatus.receive !== 'granted') {
    console.log('Permiso de notificaciones denegado');
    return;
  }

  await PushNotifications.register();
}
