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
      <ion-card>
        <ion-card-header>
            <ion-card-title>Apariencia</ion-card-title>
        </ion-card-header>

        <ion-card-content>
            <ion-select
                v-model="tema"
                label="Tema"
                fill="outline">
                <ion-select-option value="sistema">Por defecto</ion-select-option>
                <ion-select-option value="claro">Modo luz</ion-select-option>
                <ion-select-option value="oscuro">Modo oscuro</ion-select-option>
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
      </ion-card>
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
  IonMenuButton,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonSelect,
  IonSelectOption,
  IonToggle,
  IonCardTitle
} from '@ionic/vue';

import { ref, watch, onMounted } from 'vue';

const tema = ref('sistema');
const tamanoLetra = ref('normal');
const altoContraste = ref(false);
const notificaciones = ref(true); 

const token = localStorage.getItem('token');

const aplicarConfiguracion = () => {
    document.body.classList.remove(
        'tema-default',
        'tema-claro',
        'tema-oscuro',
        'texto-normal',
        'texto-grande',
        'texto-muy-grande',
        'alto-contraste'
    );

    if (tema.value === 'sistema') {
        document.body.classList.add('tema-default');
    }

    if (tema.value === 'claro') {
        document.body.classList.add('tema-claro');
    }

    if (tema.value === 'oscuro') {
        document.body.classList.add('tema-oscuro');
    }

    document.body.classList.add(`texto-${tamanoLetra.value}`);

    if (altoContraste.value) {
        document.body.classList.add('alto-contraste');
    }
};


const cargarConfiguracion = async () => {
    try {
        const res = await fetch(
            'http://192.168.1.80:3000/config',
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const config = await res.json();

        tema.value = config.tema || 'sistema';
        tamanoLetra.value = config.tamano_letra || 'normal';
        altoContraste.value = Boolean(config.alto_contraste);
        notificaciones.value = Boolean(config.notificaciones);

        aplicarConfiguracion();
    } catch (error) {
        console.error(error);
    }
};

const guardarConfiguracion = async () => {
    try{
        await fetch(
            'http://192.168.1.80:3000/config',
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
    } catch (error) {
        console.error(error);
    }
};

onMounted(() => {
    cargarConfiguracion();
});

watch(
    [tema, tamanoLetra, altoContraste, notificaciones],
    () => {
        aplicarConfiguracion();
        guardarConfiguracion();
    }
);


</script>