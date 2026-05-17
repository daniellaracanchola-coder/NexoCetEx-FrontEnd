<template>
  <ion-page>

    <ion-header>
      <ion-toolbar>
        <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
          <ion-title>Iniciar sesión</ion-title>
          <div style="display: flex; align-items: center;">
            <img 
                src="@/assets/AppLogo.png" 
                style="height:40px; margin-right:8px;"
            />
            <p style="margin: 0;"> NEXO CETI EXPRESS </p>
          </div>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="login-bg">

        <ion-input 
            v-model="username" 
            placeholder="Usuario"
            fill="outline">
        </ion-input>

      <ion-input
        v-model="password"
        type="password"
        placeholder="Contraseña"
        fill="outline">
      </ion-input>

      <ion-button expand="block" 
      @click="login"
      :disabled="!username || !password">
        Entrar
      </ion-button>
      
      <ion-button expand="block"
      fill="clear"
      @click="goRegister">
      ¿No tienes cuenta? ¡Registrate aqui!
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
import { iniciarNotificacionesPush } from '@/services/pushNotification';

const router = useRouter();

const username = ref('');
const password = ref('');

const errorMensaje = ref('');

if (localStorage.getItem('token')){
    router.push('/home');
}

const login = async () => {
  if (!username.value || !password.value) {
    errorMensaje.value = 'Completa todos los campos';
    return;
  }

  try {
    const res = await fetch(
        'http://192.168.1.80:3000/auth/login',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username.value,
                password: password.value
            })
        }
    );
    const data = await res.json();

    if (!res.ok) {
        errorMensaje.value = data.mensaje;
        password.value = '';
        return;
    }

    localStorage.setItem(
        'usuario',
        JSON.stringify(data.usuario)
    );

    localStorage.setItem(
        'token',
        data.token
    );

    await iniciarNotificacionesPush();

    errorMensaje.value = '';
    router.push('/home');
  } catch (error) {
    console.error(error);
    errorMensaje.value = 'Error al conectar con el servidor';
  }
};

const goRegister = () => {
    router.push('/register');
};
</script>