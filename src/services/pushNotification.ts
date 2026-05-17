import { PushNotifications } from '@capacitor/push-notifications';

export async function iniciarNotificacionesPush() {
  console.log('Iniciando Push Notifications...');

  let permStatus = await PushNotifications.checkPermissions();

  if (permStatus.receive === 'prompt') {
    permStatus = await PushNotifications.requestPermissions();
  }

  if (permStatus.receive !== 'granted') {
    console.log('Permiso de notificaciones denegado');
    return;
  }

  console.log('Registrando con Firebase...');

  await PushNotifications.register();

  console.log('Registro solicitado');

  PushNotifications.addListener('registration', async (token) => {
    console.log('========================');
    console.log('TOKEN FIREBASE');
    console.log(token.value);
    console.log('========================');

    try {
      const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

      console.log('Usuario localStorage:', JSON.stringify(usuario, null, 2));

      const respuesta = await fetch('http://10.0.2.2:3000/api/usuarios/guardar-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: usuario.id,
          token: token.value
        })
      });

      console.log('STATUS BACKEND:', respuesta.status);

      const texto = await respuesta.text();
      console.log('RESPUESTA BACKEND:', texto);
    } catch (error) {
      console.error('Error conectando al backend:', error);
    }
  });

  PushNotifications.addListener('registrationError', (error) => {
    console.error('Error al registrar push:', error);
  });

  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log(
      'Notificación recibida:',
      JSON.stringify(notification, null, 2)
    );
  });

  PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
    console.log('Notificación abierta:', notification);
  });
}