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
import { 
    ref, 
    onMounted, 
    onUnmounted 
} from 'vue';

let intervalDudas: any;

const abrirM = ref(false);
const dudas = ref<any[]>([]);
const nuevaDuda = ref('');
const usuario = ref<any>(null);

onMounted(async () => {
    cargarDudas();
    intervalDudas = setInterval(() => {
        cargarDudas();
    }, 5000);

    const userData = localStorage.getItem('usuario');
    if (userData) {
            usuario.value = JSON.parse(userData);
    }
});

const cargarDudas = async () => {
    try {
        const res = await fetch('http://192.168.1.80:3000/dudas');
        if (!res.ok) {
            throw new Error('Error en el servidor');
        }
        const data = await res.json();
        dudas.value = data.map(d => ({
            ...d,
            mostrarRespuesta: false,
            nuevaRespues: ''
            }));
        } catch (error) {
        console.error('Error al cargar dudas:', error);
    }
};

onUnmounted(() => {
    clearInterval(intervalDudas);
});

const crearDuda = async () => {
    if (!nuevaDuda.value) return;
    try {
        const res = await fetch('http://192.168.1.80:3000/dudas', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            conte: nuevaDuda.value,
            autor: usuario.value?.username || 'anonimo'
        })
    });
    
    if (!res.ok) {
        throw new Error('Error al crear duda'); 
    }
    
    const data = await res.json();
    
    dudas.value.unshift({
        ...data,
        mostrarRespuesta: false,
        nuevaRespues: ''
    });

    nuevaDuda.value = '';
    abrirM.value = false;
    } catch (error) {
        console.error('Error al crear duda:', error);
        alert('No se pudo crear la duda');
    }
};

const responder = async (dud: any) => {
    if (!dud.nuevaRespues) return;

    try {
        const res = await fetch (
            `http://192.168.1.80:3000/dudas/${dud.id}/respuestas`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    autor: usuario.value?.username || 'usuario',
                    conte: dud.nuevaRespues
                })
            }
        );

        if (!res.ok) {
            throw new Error('Error al responder');
        }

        dud.respuestas.push({
            autor: usuario.value?.username || 'usuario',
            conte: dud.nuevaRespues,
            fecha: new Date().toISOString()
        });

        dud.nuevaRespues = '';
        dud.mostrarRespuesta = false;
    } catch (error) {
        console.error(error);
        alert('No se pudo enviar la respuesta');
    }
};

const eliminar = async (id: number) => {
    try {
        const res = await fetch(
            `http://192.168.1.80:3000/dudas/${id}`,
            {
                method: 'DELETE'
            }
        );

        if (!res.ok) {
            throw new Error('Error al eliminar');
        }

        dudas.value = dudas.value.filter(d => d.id !== id);

    } catch (error) {
        console.error(error);
        alert('No se puede eliminar la duda');
    }
};

const toggleRevision = async (dud: any) => {
    try {
        const res = await fetch(
            `http://192.168.1.80:3000/dudas/${dud.id}/revision`,
            {
                method: 'PUT'
            }
        );

        if(!res.ok) {
            throw new Error('Error al marcar para revision');
        }

        const dudaActualizada = await res.json();
        dud.revision = dudaActualizada.revision;
    } catch (error) {
        console.error(error);
        alert('No se pudo marcar para revision');
    }
};

const toggleImportant = async (dud: any) => {
    try {
        const res = await fetch(
            `http://192.168.1.80:3000/dudas/${dud.id}/importancia`,
            {
                method: 'PUT'
            }
        );

        if (!res.ok) {
            throw new Error('Error al cambiar su importancia');
        }

        const dudaActualizada = await res.json();
        dud.importancia = dudaActualizada.importancia;
    } catch (error) {
        console.error(error);
        alert('No se pudo cambiar su importancia');
    }
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