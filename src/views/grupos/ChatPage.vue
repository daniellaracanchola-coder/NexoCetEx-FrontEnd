<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button default-href="/grupos"></ion-back-button>
                </ion-buttons>

                <ion-title>
                    Chat
                </ion-title>    
            </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
            <ion-accordion-group>
                <ion-accordion value="admin-chat">
                    <ion-item slot="header">
                        <ion-label>Opciones del chat</ion-label>
                    </ion-item>
                    <div slot="content" class="admin-chat">
                        <ion-input
                            v-model="nuevoNombre"
                            placeholder="Nuevo nombre para el chat"
                            fill="outline">
                        </ion-input>

                        <div class="btn-solo">
                          <ion-button @click="cambiarNombre">Cambiar el nombre</ion-button>
                        </div>

                        <ion-input
                            v-model="busqueda"
                            placeholder="Buscar usuario para agregar"
                            fill="outline"
                            @ionInput="buscarUsuarios">
                        </ion-input>

                        <ion-card
                            v-for="user in usuariosEncontrados"
                            :key="user.id">
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
                            :key="integrante.id">

                                <ion-label>
                                    {{ integrante.username }} - {{ integrante.rol }}
                                </ion-label>

                                <ion-button
                                    slot="end"
                                    color="danger"
                                    size="small"
                                    @click="eliminarIntegrante(integrante.id)">
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
                message="¿Seguro que quieres eliminar este chat? Esta accion no se puede revertir despues."
                :buttons="[
                    {
                        text: 'Cancelar',
                        role: 'cancel',
                        handler: () => mostrarConfirmacion = false
                    },
                    {
                        text: 'Eliminar',
                        role: 'destructive',
                        handler: eliminarChat
                    }
            ]">
            </ion-alert>

            <ion-card
                v-for="mensaje in mensajes"
                :key="mensaje.id">

                <ion-card-content>
                    <strong>{{ mensaje.username }}</strong>
                    <p>
                        {{ mensaje.contenido }}
                    </p>

                    <small>
                        {{ new Date(mensaje.fecha).toLocaleString() }}
                    </small>
                </ion-card-content>
            </ion-card>
        </ion-content>
        
        <ion-footer>
            <ion-toolbar class="chat-footer-toolbar">
                <ion-input
                    v-model="nuevoMensaje"
                    placeholder="Escribe un mensaje"
                    fill="outline"
                    @keyup.enter="enviarMensaje">
                </ion-input>

                <ion-button @click="enviarMensaje">
                    Enviar
                </ion-button>
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
    IonAccordion
} from '@ionic/vue';

import {
    ref,
    onMounted,
    onUnmounted
} from 'vue';

import {
    useRoute
} from 'vue-router';

import {
    useRouter
} from 'vue-router';

import { mostrarToast } from '@/services/feedback';

const route = useRoute();
const token = localStorage.getItem('token');
const chatId = route.params.id;
const mensajes = ref<any[]>([]);
const nuevoMensaje = ref('');
const integrantes = ref<any[]>([]);
const usuariosEncontrados = ref<any[]>([]);
const busqueda = ref('');
const nuevoNombre = ref('');
const mostrarConfirmacion = ref(false);
const router = useRouter();

let intervalMensajes: any;

//Para cargar los mensajes del chat
const cargarMensajes = async () => {
    try {
        const res = await fetch(
            `https://backend-nexo.onrender.com/chats/${chatId}/mensajes`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        mensajes.value = await res.json();
    } catch (error) {
        console.error(error);
    }
};

//Para enviar los mensajes al chat
const enviarMensaje = async () => {
    if (!nuevoMensaje.value) return;

    try {
        const res = await fetch(
            `https://backend-nexo.onrender.com/chats/${chatId}/mensajes`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    contenido: nuevoMensaje.value
                })
            }
        );

        if (!res.ok) {
            await mostrarToast('No se pudo enviar el mensaje', 'danger');
            return;
        }

        nuevoMensaje.value = '';
        await cargarMensajes();
        await mostrarToast('Mensaje enviado', 'success');
    } catch (error) {
        console.error(error);
        await mostrarToast('Error de conexión al enviar', 'danger');
    }
};

onMounted(() => {
    cargarMensajes();
    cargarIntegrantes();

    intervalMensajes = setInterval(() => {
        cargarMensajes();
    }, 2000);
});

//Para cargar a los integrantes
const cargarIntegrantes = async () => {
    try {
        const res = await fetch(
            `https://backend-nexo.onrender.com/chats/${chatId}/integrantes`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        integrantes.value = await res.json();
    } catch (error) {
        console.error(error);
    }
};

// Para buscar usuarios para agregarlos al chat
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

//Para agregar nuevos integrantes
const agregarIntegrante = async (usuarioId: number) => {
    try {
        const res = await fetch(
            `https://backend-nexo.onrender.com/chats/${chatId}/integrantes`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    usuarioId
                })
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

// Para eliminar integrantes
const eliminarIntegrante = async (usuarioId: number) => {
    try {
        const res = await fetch(
            `https://backend-nexo.onrender.com/chats/${chatId}/integrantes/${usuarioId}`,
            {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
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

//Para cambiar el nombre al grupo
const cambiarNombre = async () => {
    if (!nuevoNombre.value) return;

    try {
        const res = await fetch(
            `https://backend-nexo.onrender.com/chats/${chatId}/nombre`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    nombre: nuevoNombre.value
                })
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

//Para eliminar el chat
const eliminarChat = async () => {
    mostrarConfirmacion.value = false;
    try {
        const res = await fetch(
            `https://backend-nexo.onrender.com/chats/${chatId}`,
            {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

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

onUnmounted(() => {
    clearInterval(intervalMensajes);
});
</script>
