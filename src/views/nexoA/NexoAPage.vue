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
            Nexo de ayuda
          </ion-title> 
          <p style="margin: 0;"> NEXO CETI EXPRESS </p>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="nexoA">
      <h2>Centro de Apoyo a estudiantes, solucion de dudas y apoyo de la comunidad</h2>
      <h3> <strong>Esta seccion es para compartir dudas escolares y recibir apoyo de otros alumnos o del personal escolar</strong> </h3>
      <div class="duda">
        <p> ¿Tienes dudas? </p>
      </div>
      <ion-button v-if="usuario?.rol !== 'admin'" expand="block" @click="abrirM = true">
        Presiona aqui
      </ion-button>

      <ion-card 
      v-for="dud in dudas" 
      :key="dud.id"
      :style="{
        border: dud.revision
        ? '3px solid red'
        : (dud.importancia ? '2px solid orange' : '1px solid #ddd'),
        opacity: dud.revision ? 0.5 : 1  
      }">
        <ion-card-content>
          <p> {{ dud.autor }} </p>
          <p> {{ dud.conte }} </p>
          <div v-for="respues in dud.respuestas"
          :key="respues.fecha">
            <p>
            {{ respues.autor }}: {{ respues.conte}}
            </p>
          </div>
          <ion-button @click="dud.mostrarRespuesta = !dud.mostrarRespuesta">
            Ayudar
          </ion-button>
          <ion-input
          v-if="dud.mostrarRespuesta"
          v-model="dud.nuevaRespues"
          placeholder="¿Conoces la respuesta?">
          </ion-input>
          <ion-button
          v-if="dud.mostrarRespuesta"
          @click="responder(dud)">
            Enviar
          </ion-button>

          <ion-button v-if="usuario?.rol === 'profesor'" @click="toggleRevision(dud)">
            Favor de revisar
          </ion-button>
          <ion-button v-if="usuario?.rol === 'profesor'" @click="toggleImportant(dud)">
            Marcar como importante
          </ion-button>
          <ion-button v-if="usuario?.rol === 'admin'" color="danger" @click="eliminar(dud.id)">
            Eliminar
          </ion-button>
        </ion-card-content>
      </ion-card>
      
      <ion-modal :is-open="abrirM">
        <ion-header>
          <ion-toolbar>
            <ion-title>Nueva publicacion</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content class="Pregun">
          <ion-input
            v-model="nuevaDuda"
            placeholder="¿Cual es tu duda?">
          </ion-input>
          <ion-button expand="block" @click="crearDuda">
            Publicar
          </ion-button>
          <ion-button expand="block" color="medium" @click="abrirM = false">
            Cancelar
          </ion-button>
        </ion-content>
        
        
        
      </ion-modal>
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
  IonButton,
  IonModal,
  IonInput,
  IonCard,
  IonCardContent
} from '@ionic/vue';
import { ref, onMounted } from 'vue';

const abrirM = ref(false);
const dudas = ref([]);
const nuevaDuda = ref('');
const usuario = ref(null);

onMounted(() => {
  const userData = localStorage.getItem('usuario');
  if (userData) {
    usuario.value = JSON.parse(userData);
  }
  const dudaData =  localStorage.getItem('dudas');
  if (dudaData) {
    dudas.value = JSON.parse(dudaData);
  }
});
const crearDuda = () => {
  if(!nuevaDuda.value) return;
  dudas.value.unshift({
    id: Date.now(),
    conte: nuevaDuda.value,
    autor: usuario?.value?.username,
    fecha: new Date().toISOString(),
    respuestas: [],
    mostrarRespuesta: false,
    nuevaRespues: '',
    importancia: false,
    revision: false
  });
  nuevaDuda.value = '';
  abrirM.value = false;
  localStorage.setItem('dudas', JSON.stringify(dudas.value));
};

const responder = (dud: any) => {
  if (!dud.nuevaRespues) return;
  dud.respuestas.push({
    autor: usuario.value?.username || 'usuario',
    conte: dud.nuevaRespues,
    fecha: new Date().toISOString()
  });
  dud.nuevaRespues = '';
  dud.mostrarRespuesta = false;
  localStorage.setItem('dudas', JSON.stringify(dudas.value));
};

const eliminar = (id: number) => {
  dudas.value = dudas.value.filter(d => d.id !== id);
  localStorage.setItem('dudas', JSON.stringify(dudas.value));
};

const toggleRevision = (dud: any) => {
  dud.revision = !dud.revision;
  localStorage.setItem('dudas', JSON.stringify(dudas.value));
};

const toggleImportant = (dud: any) => {
  dud.importancia = !dud.importancia;
  localStorage.setItem('dudas', JSON.stringify(dudas.value));
};

</script>

<style>
  .duda {
    background-color: #95f8f0e0;
  }
  .duda p {
    background-color: #95f8f0e0;
    text-align: center;
  }
</style>