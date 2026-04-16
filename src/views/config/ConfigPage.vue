<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"> 
          <ion-menu-button></ion-menu-button> 
        </ion-buttons> 
        <div style="display: flex; align-items: center;">
          <ion-title> 
            <img src="@/assets/AppLogo.png" style="height:40px; margin-right:8px;"> 
            Configuracion y Accesibilidad
          </ion-title> 
          <p style="margin: 0;"> NEXO CETI EXPRESS </p>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="conf">
      <h2>Aqui puedes elegir y configurar detalles en la app</h2>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonMenuButton
} from '@ionic/vue';
</script>