<template>
  <ion-page>
    <ion-header>
      <AppPageHeader title="Nexo de ayuda" />
    </ion-header>

    <ion-content class="nexoA">
      <p class="page-intro">
        Centro de apoyo a estudiantes: comparte dudas escolares y recibe apoyo
        de otros alumnos o del personal.
      </p>
      <div class="duda-banner">
        <p>¿Tienes dudas?</p>
      </div>
      <div class="btn-solo" v-if="usuario?.rol !== 'admin'">
        <ion-button @click="abrirM = true">Presiona aquí</ion-button>
      </div>

      <ion-card
      v-for="dud in dudas"
      :key="dud.id"
      :class="{
        'duda-card--revision': dud.revision,
        'duda-card--importante': dud.importancia && !dud.revision
      }"
      :style="{ opacity: dud.revision ? 0.7 : 1 }"
      >
        <ion-card-content>
          <p> {{ dud.autor }} </p>
          <p> {{ dud.conte }} </p>
          <div v-for="respues in dud.respuestas"
          :key="respues.fecha">
            <p>
            {{ respues.autor }}: {{ respues.conte}}
            </p>
          </div>
          <div class="btn-group btn-group--card">
            <ion-button @click="dud.mostrarRespuesta = !dud.mostrarRespuesta">
              Ayudar
            </ion-button>
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
          </div>
          <ion-input
            v-if="dud.mostrarRespuesta"
            v-model="dud.nuevaRespues"
            placeholder="¿Conoces la respuesta?"
            class="input-space">
          </ion-input>
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
          <div class="btn-group btn-group--modal">
            <ion-button @click="crearDuda">Publicar</ion-button>
            <ion-button color="medium" @click="abrirM = false">Cancelar</ion-button>
          </div>
        </ion-content>
        
        
        
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonContent,
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
import { mostrarToast } from '@/services/feedback';
import AppPageHeader from '@/components/AppPageHeader.vue';

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
        const res = await fetch('https://backend-nexo.onrender.com/dudas');
        if (!res.ok) {
            throw new Error('Error en el servidor');
        }
        const data = await res.json();
        dudas.value = data.map((d: any) => ({
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
        const res = await fetch('https://backend-nexo.onrender.com/dudas', {
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
    await mostrarToast('Tu duda se publicó', 'success');
    } catch (error) {
        console.error('Error al crear duda:', error);
        await mostrarToast('No se pudo crear la duda', 'danger');
    }
};

const responder = async (dud: any) => {
    if (!dud.nuevaRespues) return;

    try {
        const res = await fetch (
            `https://backend-nexo.onrender.com/dudas/${dud.id}/respuestas`,
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
        await mostrarToast('Respuesta enviada', 'success');
    } catch (error) {
        console.error(error);
        await mostrarToast('No se pudo enviar la respuesta', 'danger');
    }
};

const eliminar = async (id: number) => {
    try {
        const res = await fetch(
            `https://backend-nexo.onrender.com/dudas/${id}`,
            {
                method: 'DELETE'
            }
        );

        if (!res.ok) {
            throw new Error('Error al eliminar');
        }

        dudas.value = dudas.value.filter(d => d.id !== id);
        await mostrarToast('Publicación eliminada', 'success');

    } catch (error) {
        console.error(error);
        await mostrarToast('No se puede eliminar la duda', 'danger');
    }
};

const toggleRevision = async (dud: any) => {
    try {
        const res = await fetch(
            `https://backend-nexo.onrender.com/dudas/${dud.id}/revision`,
            {
                method: 'PUT'
            }
        );

        if(!res.ok) {
            throw new Error('Error al marcar para revision');
        }

        const dudaActualizada = await res.json();
        dud.revision = dudaActualizada.revision;
        await mostrarToast('Estado de revisión actualizado', 'success');
    } catch (error) {
        console.error(error);
        await mostrarToast('No se pudo marcar para revisión', 'danger');
    }
};

const toggleImportant = async (dud: any) => {
    try {
        const res = await fetch(
            `https://backend-nexo.onrender.com/dudas/${dud.id}/importancia`,
            {
                method: 'PUT'
            }
        );

        if (!res.ok) {
            throw new Error('Error al cambiar su importancia');
        }

        const dudaActualizada = await res.json();
        dud.importancia = dudaActualizada.importancia;
        await mostrarToast('Importancia actualizada', 'success');
    } catch (error) {
        console.error(error);
        await mostrarToast('No se pudo cambiar la importancia', 'danger');
    }
};

</script>
