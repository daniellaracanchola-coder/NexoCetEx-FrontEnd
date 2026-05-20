<template>
  <ion-page>
    <ion-header>
      <AppPageHeader title="Grupos" />
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

                    <div class="btn-solo">
                      <ion-button @click="crearGrupo">
                        Crear grupo con usuarios seleccionados
                      </ion-button>
                    </div>

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

                            <div class="btn-group btn-group--card">
                              <ion-button @click="crearChatDirecto(user.id)">
                                Crear chat directo
                              </ion-button>
                              <ion-button
                                color="medium"
                                @click="seleccionarUsuario(user.id)">
                                {{
                                  usuariosSeleccionados.includes(user.id)
                                    ? 'Quitar del grupo'
                                    : 'Agregar al grupo'
                                }}
                              </ion-button>
                            </div>
                        </ion-card-content>
                    </ion-card>
                </div>
            </ion-accordion>
        </ion-accordion-group>
                    
        <h2>Mis chats</h2>

        <ion-card
            v-for="chat in chats"
            :key="chat.id"
            button
            class="chat-list-card"
            @click="entrarChat(chat.id)">
            <ion-card-header>
                <ion-card-title>
                    {{ chat.nombreMostrar || chat.nombre || 'Chat' }}
                </ion-card-title>
            </ion-card-header>

            <ion-card-content>
                <p class="chat-list-meta">Tipo: {{ chat.tipo }}</p>

                <p v-if="chat.grado && chat.grupo" class="chat-list-meta">
                    Grupo: {{ chat.grado }}{{ chat.grupo }}
                </p>

                <p class="chat-list-hint">Toca para abrir el chat</p>
            </ion-card-content>
        </ion-card>
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
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonAccordion,
  IonAccordionGroup,
  IonLabel,
} from '@ionic/vue';

import {
    ref,
    onMounted,
    onUnmounted
} from 'vue';

import { useRouter } from 'vue-router';
import { mostrarToast } from '@/services/feedback';
import AppPageHeader from '@/components/AppPageHeader.vue';

const router = useRouter();

const entrarChat = (chatId: number) => {
  router.push(`/chat/${chatId}`);
};

const token = localStorage.getItem('token');

const busqueda = ref('');
const usuariosEncontrados = ref<any[]>([]);
const chats = ref<any[]>([]);

let intervalGrupos: any;

const crearGrupoAula = async () => {
    try{
        await fetch(
            'https://backend-nexo.onrender.com/chats/aula',
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
            'https://backend-nexo.onrender.com/chats/mis-chats',
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
            `https://backend-nexo.onrender.com/chats/usuarios?buscar=${busqueda.value}`,
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
        const res = await fetch(
            'https://backend-nexo.onrender.com/chats/directo',
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
        if (!res.ok) {
            await mostrarToast('No se pudo crear el chat directo', 'danger');
            return;
        }
        busqueda.value = '';
        usuariosEncontrados.value = [];
        usuariosSeleccionados.value = [];
        await cargarChats();
        await mostrarToast('Chat directo creado', 'success');
    } catch (error) {
        console.error(error);
        await mostrarToast('Error de conexión', 'danger');
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
        await mostrarToast('Indica un nombre de grupo y al menos un usuario', 'warning');
        return;
    }

    try {
        const res = await fetch(
            'https://backend-nexo.onrender.com/chats/grupo',
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

        if (!res.ok) {
            await mostrarToast('No se pudo crear el grupo', 'danger');
            return;
        }

        nombreGrupo.value = '';
        usuariosSeleccionados.value = [];
        usuariosEncontrados.value = [];

        await cargarChats();
        await mostrarToast('Grupo creado correctamente', 'success');
    } catch (error) {
        console.error(error);
        await mostrarToast('Error de conexión', 'danger');
    }
};

</script>
