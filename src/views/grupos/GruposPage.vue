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
            Grupos
          </ion-title> 
          <p style="margin: 0;"> NEXO CETI EXPRESS </p>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="group">
        <h2>Grupos</h2>
        <ion-accordion-group>
            <ion-accordion value="grupos">
                <ion-item slot="header">
                    <ion-label>Crear chats</ion-label>
                </ion-item>
                <div slot="content">
                    <ion-input
                        v-model="busqueda"
                        placeholder="Buscar usuario"
                        fill="outline"
                        class="buscador"
                        @ionInput="buscarUsuarios">
                    </ion-input>

                    <ion-input
                        v-model="nombreGrupo"
                        placeholder="Nombre del grupo"
                        fill="outline"
                        class="buscador">
                    </ion-input>

                    <ion-button
                        expand="block"
                        @click="crearGrupo">
                        Crear grupo con usuarios seleccionados
                    </ion-button>

                    <p style="text-align:center;">
                        Usuarios seleccionados:
                        {{ usuariosSeleccionados.length }}
                    </p> 

                    <ion-card
                        v-for="user in usuariosEncontrados"
                        :key="user.id">
                        <ion-card-content>
                            <p> {{ user.username }}</p>
                            <p> Rol: {{ user.rol }}</p>

                            <ion-button
                                expand="block"
                                @click="crearChatDirecto(user.id)">
                                Crear chat directo 
                            </ion-button>
                            <ion-button
                                expand="block"
                                color="medium"
                                @click="seleccionarUsuario(user.id)">
                                {{
                                    usuariosSeleccionados.includes(user.id)
                                        ? 'Quitar del grupo'
                                        : 'Agregar al grupo'
                                }}
                            </ion-button>
                        </ion-card-content>
                    </ion-card>
                </div>
            </ion-accordion>
        </ion-accordion-group>
                    
        <h2>Mis chats</h2>

        <ion-card
            v-for="chat in chats"
            :key="chat.id">
            <ion-card-header>
                <ion-card-title>
                    {{ chat.nombreMostrar || chat.nombre || 'Chat' }}
                </ion-card-title>
            </ion-card-header>

            <ion-card-content>
                <p>Tipo: {{ chat.tipo }}</p>

                <p v-if="chat.grado && chat.grupo">
                    Grupo: {{ chat.grado }}{{ chat.grupo }}
                </p>
            </ion-card-content>

            <ion-button
                expand="block"
                @click="router.push(`/chat/${chat.id}`)">
                Entrar al chat
            </ion-button>
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
  IonInput,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonAccordion,
  IonAccordionGroup
} from '@ionic/vue';

import {
    ref,
    onMounted,
    onUnmounted
} from 'vue';

import { useRouter } from 'vue-router';

const router = useRouter();

const token = localStorage.getItem('token');

const busqueda = ref('');
const usuariosEncontrados = ref<any[]>([]);
const chats = ref<any[]>([]);

let intervalGrupos: any;

const crearGrupoAula = async () => {
    try{
        await fetch(
            'http://192.168.1.80:3000/chats/aula',
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
    } catch (error) {
        console.error(error);
    }
};

const cargarChats = async () => {
    try {
        const res = await fetch(
            'http://192.168.1.80:3000/chats/mis-chats',
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        chats.value = await res.json();
    } catch (error) {
        console.error(error);
    }
};

const buscarUsuarios = async () => {
    if (!busqueda.value) {
        usuariosEncontrados.value = [];
        return;
    }

    try {
        const res = await fetch(
            `http://192.168.1.80:3000/chats/usuarios?buscar=${busqueda.value}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        usuariosEncontrados.value = await res.json();
    } catch (error) {
        console.error(error);
    }
};

const crearChatDirecto = async (usuarioDestinoId: number) =>  {
    try {
        await fetch(
            'http://192.168.1.80:3000/chats/directo',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    usuarioDestinoId
                })
            }
        );
        busqueda.value = '';
        usuariosEncontrados.value = [];
        usuariosSeleccionados.value = [];
        await cargarChats();
    } catch (error) {
        console.error(error);
    }
};

onMounted(async () => {
    await crearGrupoAula();
    await cargarChats();

    intervalGrupos = setInterval(() => {
        cargarChats();    
    }, 5000);
});

onUnmounted(() => {
    clearInterval(intervalGrupos);
});

const nombreGrupo = ref('');
const usuariosSeleccionados = ref<number[]>([]);

const seleccionarUsuario = (id: number) => {
    if (usuariosSeleccionados.value.includes(id)) {
        usuariosSeleccionados.value = usuariosSeleccionados.value.filter(
            usuarioId => usuarioId !== id
        );
    } else {
        usuariosSeleccionados.value.push(id);
    }
};

const crearGrupo = async () => {
    if (!nombreGrupo.value || usuariosSeleccionados.value.length === 0) {
        return;
    }

    try {
        await fetch(
            'http://192.168.1.80:3000/chats/grupo',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    nombre: nombreGrupo.value,
                    integrantes: usuariosSeleccionados.value
                })
            }
        );

        nombreGrupo.value = '';
        usuariosSeleccionados.value = [];
        usuariosEncontrados.value = [];

        await cargarChats();
    } catch (error) {
        console.error(error);
    }
};

</script>

<style scoped>
.buscador{
    width: 50%;
    border-radius: 10% 10% 10% 10%;
    margin: 16px auto;
    background-color: #f1e7b9;
    color: #000000;
}

ion-card {
    border-radius: 0 16px 0 16px;
    margin-bottom: 16px;
}
</style>