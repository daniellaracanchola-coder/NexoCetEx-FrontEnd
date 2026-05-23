<template>
  <ion-page>
    <ion-header>
      <AppPageHeader title="Grupos" />
    </ion-header>

    <ion-content class="group" :class="{ 'vista-solo-lectura': modoOffline }">
        <BannerOffline :activo="modoOffline" :fecha="fechaRespaldo" />
        <h2>Grupos</h2>
        <ion-accordion-group v-if="!modoOffline">
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
            :class="{ 'chat-list-card--unread': chat.mensajesNoLeidos > 0 }"
            @click="entrarChat(chat.id)">
            <ion-card-header>
                <ion-card-title class="chat-list-title-row">
                    <span>{{ chat.nombreMostrar || chat.nombre || 'Chat' }}</span>
                    <ion-badge
                        v-if="chat.mensajesNoLeidos > 0"
                        color="danger"
                        class="chat-unread-badge"
                    >
                        {{ chat.mensajesNoLeidos }}
                    </ion-badge>
                </ion-card-title>
            </ion-card-header>

            <ion-card-content>
                <p
                    v-if="chat.ultimoMensajePreview"
                    class="chat-list-preview"
                    :class="{ 'chat-list-preview--unread': chat.mensajesNoLeidos > 0 }"
                >
                    {{ chat.ultimoMensajePreview }}
                </p>
                <p v-else class="chat-list-preview chat-list-preview--empty">
                    Sin mensajes aún
                </p>

                <p v-if="chat.ultimoMensajeFecha" class="chat-list-meta">
                    {{ formatearFechaRelativa(chat.ultimoMensajeFecha) }}
                </p>
                <p v-else class="chat-list-meta">Tipo: {{ chat.tipo }}</p>
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
  IonBadge,
} from '@ionic/vue';

import {
    ref,
    onMounted,
    onUnmounted,
} from 'vue';

import { useRouter } from 'vue-router';
import { onIonViewWillEnter } from '@ionic/vue';
import { mostrarToast } from '@/services/feedback';
import AppPageHeader from '@/components/AppPageHeader.vue';
import BannerOffline from '@/components/BannerOffline.vue';
import {
  obtenerConCache,
  clavesCache,
  fetchJsonConAuth,
  formatearFechaRespaldo,
} from '@/services/cacheOffline';

const router = useRouter();
const usuarioId = JSON.parse(localStorage.getItem('usuario') || '{}')?.id ?? 0;

const modoOffline = ref(false);
const fechaRespaldo = ref('');

const entrarChat = (chatId: number) => {
  router.push(`/chat/${chatId}`);
};

const formatearFechaRelativa = (fecha: string) => {
  if (!fecha) return '';
  const d = new Date(fecha);
  const ahora = new Date();
  const mismoDia =
    d.getDate() === ahora.getDate() &&
    d.getMonth() === ahora.getMonth() &&
    d.getFullYear() === ahora.getFullYear();
  if (mismoDia) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleString([], {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const token = localStorage.getItem('token');

const busqueda = ref('');
const usuariosEncontrados = ref<any[]>([]);
const chats = ref<any[]>([]);

let intervalGrupos: ReturnType<typeof setInterval> | null = null;

function bloquearSiOffline(): boolean {
  if (modoOffline.value) {
    void mostrarToast(
      'Sin conexión. Solo puedes ver tus chats guardados.',
      'warning'
    );
    return true;
  }
  return false;
}

const crearGrupoAula = async () => {
    if (modoOffline.value) return;
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
        const resultado = await obtenerConCache(
            clavesCache.chats(usuarioId),
            () =>
                fetchJsonConAuth<any[]>(
                    'https://backend-nexo.onrender.com/chats/mis-chats',
                    token
                )
        );
        chats.value = resultado.data;
        modoOffline.value = resultado.desdeCache;
        fechaRespaldo.value = resultado.fechaCache
            ? formatearFechaRespaldo(resultado.fechaCache)
            : '';
    } catch (error) {
        console.error(error);
    }
};

const buscarUsuarios = async () => {
    if (bloquearSiOffline()) return;
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
    if (bloquearSiOffline()) return;
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
    intervalGrupos = setInterval(() => cargarChats(), 4000);
});

onIonViewWillEnter(() => {
    cargarChats();
});

onUnmounted(() => {
    if (intervalGrupos) clearInterval(intervalGrupos);
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
    if (bloquearSiOffline()) return;
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
