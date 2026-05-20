<template>
  <ion-page>
    <ion-header>
      <AppPageHeader title="Configuración" />
    </ion-header>

    <ion-content class="conf">
      <p class="page-intro">
        Aquí puedes elegir y configurar los detalles de la app.
      </p>
      <ion-card>
        <ion-card-header>
            <ion-card-title>Apariencia</ion-card-title>
        </ion-card-header>

        <ion-card-content>
            <ion-select
                v-model="tema"
                label="Tema"
                fill="outline">
                <ion-select-option value="sistema">Según el sistema</ion-select-option>
                <ion-select-option value="claro">Modo claro</ion-select-option>
                <ion-select-option value="oscuro">Modo oscuro</ion-select-option>
                <ion-select-option value="extra">Mensajería (extra)</ion-select-option>
            </ion-select>
        </ion-card-content>
      </ion-card>

      <ion-card>
        <ion-card-header>
            <ion-card-title>Accesibilidad</ion-card-title>
        </ion-card-header>

        <ion-card-content>
            <ion-select
                v-model="tamanoLetra"
                label="Tamaño de letra"
                fill="outline">
                <ion-select-option value="normal">Por defecto</ion-select-option>
                <ion-select-option value="grande">Grande</ion-select-option>
                <ion-select-option value="muy-grande">Muy grande</ion-select-option>
            </ion-select>

            <ion-toggle 
                v-model="altoContraste">
                Alto contraste
            </ion-toggle>
        </ion-card-content>
      </ion-card>

      <ion-card>
        <ion-card-header>
            <ion-card-title>Chat y avisos</ion-card-title>
        </ion-card-header>

        <ion-card-content>
            <ion-toggle
                v-model="notificaciones">
                Recibir notificaciones
            </ion-toggle>
        </ion-card-content>

        <ion-card>
            <ion-card-header>
                <ion-card-title>Cambiar contraseña</ion-card-title>
            </ion-card-header>

            <ion-card-content>
                <ion-input
                    v-model="passwordActual"
                    type="password"
                    placeholder="Contraseña actual"
                    fill="outline">
                </ion-input>

                <ion-input
                    v-model="passwordNueva"
                    type="password"
                    placeholder="Nueva contraseña"
                    fill="outline">
                </ion-input>

                <div class="btn-solo">
                  <ion-button @click="cambiarPassword">Cambiar contraseña</ion-button>
                </div>

                <p v-if="mensajePassword" class="error-text">
                    {{ mensajePassword }}
                </p>
            </ion-card-content>
        </ion-card>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonSelect,
  IonSelectOption,
  IonToggle,
  IonCardTitle,
  IonInput,
  IonButton
} from '@ionic/vue';

import { ref, watch, onMounted } from 'vue';

import {
    aplicarConfiguracion,
    normalizarTema,
    type TemaPreferencia,
} from '@/services/configuracion';
import { mostrarToast } from '@/services/feedback';
import AppPageHeader from '@/components/AppPageHeader.vue';

const tema = ref<TemaPreferencia>('sistema');
const tamanoLetra = ref('normal');
const altoContraste = ref(false);
const notificaciones = ref(true); 

const cargandoConfig = ref(true);

const token = localStorage.getItem('token');

const cargarConfiguracion = async () => {
    try {
        const res = await fetch(
            'https://backend-nexo.onrender.com/config',
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const config = await res.json();

        tema.value = normalizarTema(config.tema);
        tamanoLetra.value = config.tamano_letra || 'normal';
        altoContraste.value = Boolean(config.alto_contraste);
        notificaciones.value = Boolean(config.notificaciones);

        aplicarConfiguracion({
            tema: tema.value,
            tamano_letra: tamanoLetra.value,
            alto_contraste: altoContraste.value
        });
    } catch (error) {
        console.error(error);
    }
    cargandoConfig.value = false;
};

const guardarConfiguracion = async () => {
    try{
        const res = await fetch(
            'https://backend-nexo.onrender.com/config',
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    tema: tema.value,
                    tamano_letra: tamanoLetra.value,
                    alto_contraste: altoContraste.value,
                    notificaciones: notificaciones.value
                })
            }
        );
        if (res.ok) {
            await mostrarToast('Preferencias guardadas', 'success', 2000);
        } else {
            await mostrarToast('No se pudo guardar en el servidor', 'danger');
        }
    } catch (error) {
        console.error(error);
        await mostrarToast('Error al guardar la configuración', 'danger');
    }
};

const passwordActual = ref('');
const passwordNueva = ref('');
const mensajePassword = ref('');

const cambiarPassword = async () => {
    try {
        const res = await fetch(
            'https://backend-nexo.onrender.com/config/cambiar-password',
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    passwordActual: passwordActual.value,
                    passwordNueva: passwordNueva.value
                })
            }
        );

        const data = await res.json();

        if (res.ok) {
            mensajePassword.value = data.mensaje || 'Contraseña actualizada';
            passwordActual.value = '';
            passwordNueva.value = '';
            await mostrarToast('Contraseña actualizada', 'success');
        } else {
            mensajePassword.value = data.mensaje || 'No se pudo cambiar la contraseña';
            await mostrarToast(mensajePassword.value, 'danger');
        }
    } catch (error) {
        console.error(error);
        mensajePassword.value = 'Error al conectar con el servidor';
        await mostrarToast(mensajePassword.value, 'danger');
    }
};

onMounted(() => {
    cargarConfiguracion();
});

watch(
    [tema, tamanoLetra, altoContraste, notificaciones],
    () => {
        aplicarConfiguracion({
            tema: tema.value,
            tamano_letra: tamanoLetra.value,
            alto_contraste: altoContraste.value
        });
        
        if (!cargandoConfig.value) {
            guardarConfiguracion();
        }
    }
);
</script>