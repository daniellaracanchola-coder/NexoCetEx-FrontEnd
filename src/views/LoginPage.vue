<template>
  <ion-page>

    <ion-header>
      <ion-toolbar>
        <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
          <ion-title>Iniciar sesión</ion-title>
          <div style="display: flex; align-items: center;">
            <img src="@/assets/AppLogo.png" style="height:40px; margin-right:8px;">
            <p style="margin: 0;"> NEXO CETI EXPRESS </p>
          </div>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="login-bg">

      <ion-input v-model="username" placeholder="Usuario"></ion-input>

      <ion-input
        v-model="password"
        type="password"
        placeholder="Contraseña">
      </ion-input>

      <ion-button expand="block" 
      @click="login"
      :disabled="!username || !password">
        Entrar
      </ion-button>
      <p v-if="errorMensaje" style="color:red;">
        {{ errorMensaje}}
      </p>
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
  IonInput,
  IonButton
} from '@ionic/vue';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const username = ref('');
const password = ref('');

const errorMensaje = ref('');

const usuarios = [
  { username: 'adDaniel', password: '1234', rol: 'admin'},
  { username: 'alumDaniel', password: '4321', rol: 'alumno'},
  { username: 'alumDan', password: '2222', rol: 'alumno'},
  { username: 'ProfeDani', password: '0000', rol: 'profesor'},
  { username: 'ProfeDan', password: '1111', rol: 'profesor'},
];

const login = () => {
  console.log("CLICK DETECTADO");

  if (!username.value || !password.value) {
    errorMensaje.value = 'Completa todos los campos';
    return;
  }

  const usuarioEncontrado = usuarios.find(
    u => u.username === username.value && u.password === password.value
  );

  if (usuarioEncontrado) {
    localStorage.setItem('usuario', JSON.stringify(usuarioEncontrado));
    errorMensaje.value = '';
    router.push('/home');
  } else {
    errorMensaje.value = 'Usuario o Contraseña incorrectos, por favor reviselos';
  }
};
</script>