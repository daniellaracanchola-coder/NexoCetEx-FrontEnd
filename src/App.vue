<template>
  <ion-app>
    <ion-menu content-id="main-content">
      <ion-header>
        <ion-toolbar>
          <ion-title>Menú</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-content class="lateral">
        <ion-item lines="none">
          <ion-label>
            <h2>{{ usuario.username }}</h2>
            <p v-if="usuario.rol" class="muted-text">{{ usuario.rol }}</p>
          </ion-label>
        </ion-item>

        <ion-list lines="none">
          <ion-item button @click="irA('/home')">Muro</ion-item>
          <ion-item button @click="irA('/grupos')">Grupos</ion-item>
          <ion-item button @click="irA('/nexo-a')">Nexo de Ayuda</ion-item>
          <ion-item button @click="irA('/config')">Configuración</ion-item>
          <ion-item v-if="usuario?.rol === 'admin'" button @click="irA('/admin')">
            Administración
          </ion-item>
          <ion-item button color="danger" @click="logout">Cerrar sesión</ion-item>
        </ion-list>
      </ion-content>
    </ion-menu>

    <ion-router-outlet id="main-content" />
  </ion-app>
</template>

<script setup lang="ts">
import {
  IonApp,
  IonRouterOutlet,
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
} from '@ionic/vue';

import { useRouter } from 'vue-router';
import { menuController } from '@ionic/vue';
import { onMounted } from 'vue';
import { initTemaLocal } from '@/services/configuracion';
import { mostrarToast } from '@/services/feedback';
import { iniciarNotificacionesPush } from '@/services/pushNotification';
import {
  registrarRouterPush,
  procesarNavegacionPendiente,
} from '@/services/navegacionPush';

const router = useRouter();

onMounted(async () => {
  registrarRouterPush(router);

  if (localStorage.getItem('token')) {
    await iniciarNotificacionesPush();
    await procesarNavegacionPendiente();
  }
});

const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

/** Cierra el menú lateral y navega (evita que el menú quede abierto). */
const irA = async (path: string) => {
  await menuController.close();
  await router.push(path);
};

const logout = async () => {
  localStorage.removeItem('usuario');
  localStorage.removeItem('token');
  initTemaLocal();
  await menuController.close();
  await mostrarToast('Sesión cerrada', 'success', 2000);
  await router.push('/login');
};
</script>
