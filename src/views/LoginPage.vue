<template>
  <ion-page>
    <ion-header>
      <AppPageHeader title="Iniciar sesión" :show-menu="false" layout="login" />
    </ion-header>

    <ion-content class="login-bg">
      <ion-input
        v-model="username"
        placeholder="Usuario"
        fill="outline"
      />

      <ion-input
        v-model="password"
        type="password"
        placeholder="Contraseña"
        fill="outline"
      />

      <div class="form-actions">
        <ion-button @click="login" :disabled="!username || !password">
          Entrar
        </ion-button>

        <ion-button fill="clear" @click="goRegister">
          ¿No tienes cuenta? ¡Regístrate aquí!
        </ion-button>
      </div>

      <p v-if="errorMensaje" class="error-text">
        {{ errorMensaje }}
      </p>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonContent,
  IonInput,
  IonButton,
} from '@ionic/vue';

import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { iniciarNotificacionesPush } from '@/services/pushNotification';
import { cargarConfiguracion } from '@/services/configuracion';
import { mostrarToast } from '@/services/feedback';
import { resolverRutaTrasLogin } from '@/services/navegacionPush';
import AppPageHeader from '@/components/AppPageHeader.vue';

const router = useRouter();

const username = ref('');
const password = ref('');
const errorMensaje = ref('');

if (localStorage.getItem('token')) {
  router.push('/home');
}

const login = async () => {
  if (!username.value || !password.value) {
    errorMensaje.value = 'Completa todos los campos';
    return;
  }

  try {
    const res = await fetch('https://backend-nexo.onrender.com/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username.value,
        password: password.value,
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      errorMensaje.value = data.mensaje;
      password.value = '';
      return;
    }

    localStorage.setItem('usuario', JSON.stringify(data.usuario));
    localStorage.setItem('token', data.token);

    await iniciarNotificacionesPush();
    await cargarConfiguracion();

    errorMensaje.value = '';
    await mostrarToast('Sesión iniciada correctamente', 'success');
    await router.push(resolverRutaTrasLogin());
  } catch (error) {
    console.error(error);
    errorMensaje.value = 'Error al conectar con el servidor';
  }
};

const goRegister = () => {
  router.push('/register');
};
</script>
