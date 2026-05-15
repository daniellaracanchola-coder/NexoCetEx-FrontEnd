<template> 
  <ion-app>

    <!-- MENÚ LATERAL -->
    <ion-menu content-id="main-content">
      <ion-header>
        <ion-toolbar>
          <ion-title>Menu</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-content>
        <ion-list>
          <ion-item router-link="/home">Muro</ion-item>
          <ion-item router-link="/grupos">Grupos</ion-item>
          <ion-item router-link="/nexo-a">Nexo de Ayuda</ion-item>
          <ion-item router-link="/config">Configuracion y Accesibilidad</ion-item>
          <ion-item router-link="/admin" v-if="usuario?.rol === 'admin'">Administracion</ion-item>
          <ion-item @click="logout">Cerrar sesion</ion-item>
        </ion-list>
      </ion-content>
    </ion-menu>

    <!-- PAGINA PRINCIPAL -->
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
  IonItem 
} from '@ionic/vue';

import { useRouter } from 'vue-router';

const router = useRouter();

const usuario = JSON.parse(
    localStorage.getItem('usuario') || 'null'
);

const logout = () => {
  localStorage.removeItem('usuario');
  router.push('/login');
};
</script>