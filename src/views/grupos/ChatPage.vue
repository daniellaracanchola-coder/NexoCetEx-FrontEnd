<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button default-href="/grupos"></ion-back-button>
                </ion-buttons>
                <ion-title>Chat</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content ref="contentRef" class="ion-padding chat-messages-content" :class="{ 'vista-solo-lectura': modoOffline }">
            <BannerOffline :activo="modoOffline" :fecha="fechaRespaldo" />
            <ion-accordion-group v-if="!modoOffline">
                <ion-accordion value="admin-chat">
                    <ion-item slot="header">
                        <ion-label>Opciones del chat</ion-label>
                    </ion-item>
                    <div slot="content" class="admin-chat">
                        <ion-input
                            v-model="nuevoNombre"
                            placeholder="Nuevo nombre para el chat"
                            fill="outline"
                        />

                        <div class="btn-solo">
                            <ion-button @click="cambiarNombre">Cambiar el nombre</ion-button>
                        </div>

                        <ion-input
                            v-model="busqueda"
                            placeholder="Buscar usuario para agregar"
                            fill="outline"
                            @ionInput="buscarUsuarios"
                        />

                        <ion-card v-for="user in usuariosEncontrados" :key="user.id">
                            <ion-card-content>
                                <p>{{ user.username }}</p>
                                <div class="btn-solo">
                                    <ion-button @click="agregarIntegrante(user.id)">
                                        Agregar al chat
                                    </ion-button>
                                </div>
                            </ion-card-content>
                        </ion-card>

                        <h3>Integrantes</h3>
                        <ion-list>
                            <ion-item
                                v-for="integrante in integrantes"
                                :key="integrante.id"
                            >
                                <ion-label>
                                    {{ integrante.username }} - {{ integrante.rol }}
                                </ion-label>
                                <ion-button
                                    slot="end"
                                    color="danger"
                                    size="small"
                                    @click="eliminarIntegrante(integrante.id)"
                                >
                                    Eliminar
                                </ion-button>
                            </ion-item>
                        </ion-list>

                        <div class="btn-solo">
                            <ion-button color="danger" @click="mostrarConfirmacion = true">
                                Eliminar chat
                            </ion-button>
                        </div>
                    </div>
                </ion-accordion>
            </ion-accordion-group>

            <ion-alert
                :is-open="mostrarConfirmacion"
                header="Eliminar chat"
                message="¿Seguro que quieres eliminar este chat? Esta acción no se puede revertir después."
                :buttons="[
                    {
                        text: 'Cancelar',
                        role: 'cancel',
                        handler: () => (mostrarConfirmacion = false),
                    },
                    {
                        text: 'Eliminar',
                        role: 'destructive',
                        handler: eliminarChat,
                    },
                ]"
            />

            <div class="chat-messages-list">
                <div
                    v-for="mensaje in mensajes"
                    :key="mensaje.id"
                    class="chat-bubble"
                    :class="{
                        'chat-bubble--propio':
                            mensaje.usuario_id === usuarioActual?.id,
                    }"
                >
                    <strong>{{ mensaje.username }}</strong>
                    <TextoConEnlaces
                        :texto="mensaje.contenido"
                        tag="p"
                    />
                    <small>{{ formatearFecha(mensaje.fecha) }}</small>
                </div>
                <div ref="finLista" class="chat-scroll-anchor" aria-hidden="true" />
            </div>
        </ion-content>

        <ion-footer v-if="!modoOffline">
            <ion-toolbar class="chat-footer-toolbar">
                <ion-input
                    v-model="nuevoMensaje"
                    placeholder="Escribe un mensaje"
                    fill="outline"
                    @keyup.enter="enviarMensaje"
                />
                <ion-button @click="enviarMensaje">Enviar</ion-button>
            </ion-toolbar>
        </ion-footer>
    </ion-page>
</template>

<script setup lang="ts">
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonContent,
    IonCard,
    IonCardContent,
    IonFooter,
    IonInput,
    IonButton,
    IonAlert,
    IonItem,
    IonLabel,
    IonList,
    IonAccordionGroup,
    IonAccordion,
} from '@ionic/vue';

import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { mostrarToast } from '@/services/feedback';
import TextoConEnlaces from '@/components/TextoConEnlaces.vue';
import BannerOffline from '@/components/BannerOffline.vue';
import {
    obtenerConCache,
    clavesCache,
    fetchJsonConAuth,
    formatearFechaRespaldo,
} from '@/services/cacheOffline';

const route = useRoute();
const router = useRouter();
const token = localStorage.getItem('token');
const chatId = String(route.params.id);

const usuarioActual = JSON.parse(localStorage.getItem('usuario') || 'null');

const contentRef = ref<InstanceType<typeof IonContent> | null>(null);
const finLista = ref<HTMLElement | null>(null);

const mensajes = ref<any[]>([]);
const nuevoMensaje = ref('');
const integrantes = ref<any[]>([]);
const usuariosEncontrados = ref<any[]>([]);
const busqueda = ref('');
const nuevoNombre = ref('');
const mostrarConfirmacion = ref(false);
const modoOffline = ref(false);
const fechaRespaldo = ref('');

let intervalMensajes: ReturnType<typeof setInterval> | null = null;

function bloquearSiOffline(): boolean {
    if (modoOffline.value) {
        void mostrarToast(
            'Sin conexión. Solo puedes ver los mensajes guardados.',
            'warning'
        );
        return true;
    }
    return false;
}

const formatearFecha = (fecha: string) => {
    if (!fecha) return '';
    return new Date(fecha).toLocaleString();
};

const scrollAlFinal = async (suave = false) => {
    await nextTick();
    if (finLista.value) {
        finLista.value.scrollIntoView({
            behavior: suave ? 'smooth' : 'auto',
            block: 'end',
        });
    }
    const ionContent = contentRef.value?.$el;
    if (ionContent?.scrollToBottom) {
        await ionContent.scrollToBottom(suave ? 300 : 0);
    }
};

const cargarMensajes = async (forzarScroll = false) => {
    try {
        const cantidadAnterior = mensajes.value.length;
        const ultimoIdAnterior =
            mensajes.value.length > 0
                ? mensajes.value[mensajes.value.length - 1].id
                : 0;

        const resultado = await obtenerConCache(
            clavesCache.mensajesChat(chatId),
            () =>
                fetchJsonConAuth<any[]>(
                    `https://backend-nexo.onrender.com/chats/${chatId}/mensajes`,
                    token
                )
        );

        const data = resultado.data;
        modoOffline.value = resultado.desdeCache;
        fechaRespaldo.value = resultado.fechaCache
            ? formatearFechaRespaldo(resultado.fechaCache)
            : '';

        const huboCambio =
            data.length !== cantidadAnterior ||
            (data.length > 0 && data[data.length - 1].id !== ultimoIdAnterior);

        mensajes.value = data;

        if (forzarScroll || huboCambio || cantidadAnterior === 0) {
            await scrollAlFinal(huboCambio && cantidadAnterior > 0);
        }
    } catch (error) {
        console.error(error);
    }
};

const enviarMensaje = async () => {
    if (!nuevoMensaje.value.trim()) return;
    if (bloquearSiOffline()) return;

    try {
        const res = await fetch(
            `https://backend-nexo.onrender.com/chats/${chatId}/mensajes`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ contenido: nuevoMensaje.value }),
            }
        );

        if (!res.ok) {
            await mostrarToast('No se pudo enviar el mensaje', 'danger');
            return;
        }

        nuevoMensaje.value = '';
        await cargarMensajes(true);
        await mostrarToast('Mensaje enviado', 'success');
    } catch (error) {
        console.error(error);
        await mostrarToast('Error de conexión al enviar', 'danger');
    }
};

const cargarIntegrantes = async () => {
    try {
        const resultado = await obtenerConCache(
            clavesCache.integrantesChat(chatId),
            () =>
                fetchJsonConAuth<any[]>(
                    `https://backend-nexo.onrender.com/chats/${chatId}/integrantes`,
                    token
                )
        );
        integrantes.value = resultado.data;
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
            { headers: { Authorization: `Bearer ${token}` } }
        );
        usuariosEncontrados.value = await res.json();
    } catch (error) {
        console.error(error);
    }
};

const agregarIntegrante = async (usuarioId: number) => {
    if (bloquearSiOffline()) return;
    try {
        const res = await fetch(
            `https://backend-nexo.onrender.com/chats/${chatId}/integrantes`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ usuarioId }),
            }
        );
        if (!res.ok) {
            await mostrarToast('No se pudo agregar al usuario', 'danger');
            return;
        }
        busqueda.value = '';
        usuariosEncontrados.value = [];
        await cargarIntegrantes();
        await mostrarToast('Usuario agregado al chat', 'success');
    } catch (error) {
        console.error(error);
        await mostrarToast('Error al agregar integrante', 'danger');
    }
};

const eliminarIntegrante = async (usuarioId: number) => {
    if (bloquearSiOffline()) return;
    try {
        const res = await fetch(
            `https://backend-nexo.onrender.com/chats/${chatId}/integrantes/${usuarioId}`,
            {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        if (!res.ok) {
            await mostrarToast('No se pudo eliminar al integrante', 'danger');
            return;
        }
        await cargarIntegrantes();
        await mostrarToast('Integrante eliminado del chat', 'success');
    } catch (error) {
        console.error(error);
        await mostrarToast('Error al eliminar integrante', 'danger');
    }
};

const cambiarNombre = async () => {
    if (!nuevoNombre.value) return;
    if (bloquearSiOffline()) return;
    try {
        const res = await fetch(
            `https://backend-nexo.onrender.com/chats/${chatId}/nombre`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ nombre: nuevoNombre.value }),
            }
        );
        if (!res.ok) {
            await mostrarToast('No se pudo cambiar el nombre', 'danger');
            return;
        }
        nuevoNombre.value = '';
        await mostrarToast('Nombre del chat actualizado', 'success');
    } catch (error) {
        console.error(error);
        await mostrarToast('Error al cambiar el nombre', 'danger');
    }
};

const eliminarChat = async () => {
    if (bloquearSiOffline()) return;
    mostrarConfirmacion.value = false;
    try {
        const res = await fetch(`https://backend-nexo.onrender.com/chats/${chatId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
            await mostrarToast('No se pudo eliminar el chat', 'danger');
            return;
        }
        await mostrarToast('Chat eliminado', 'success');
        await router.push('/grupos');
    } catch (error) {
        console.error(error);
        await mostrarToast('Error al eliminar el chat', 'danger');
    }
};

onMounted(async () => {
    await cargarMensajes(true);
    await cargarIntegrantes();
    intervalMensajes = setInterval(() => cargarMensajes(false), 2000);
});

onUnmounted(() => {
    if (intervalMensajes) clearInterval(intervalMensajes);
});
</script>
