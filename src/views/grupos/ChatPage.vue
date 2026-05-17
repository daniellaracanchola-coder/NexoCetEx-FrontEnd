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

            <ion-input
                v-model="nuevoNombre"
                placeholder="Nuevo nombre para el chat"
                fill="outline">
            </ion-input>

            <ion-button
                expand="block"
                @click="cambiarNombre">
                Cambiar el nombre
            </ion-button>

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

                    <ion-button
                    expand="block"
                    @click="agregarIntegrante(user.id)">
                    Agregar al chat
                    </ion-button>
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
                        color="danger"
                        @click="eliminarIntegrante(integrante.id)">
                        Eliminar
                    </ion-button>
                </ion-item>
            </ion-list>

            <ion-button
                expand="block"
                color="danger"
                @click="mostrarConfirmacion = true">
                Eliminar chat
            </ion-button>

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
            <ion-toolbar>
                <ion-input
                    v-model="nuevoMensaje"
                    placeholder="Escribe un mensaje">
                </ion-input>

                <ion-button
                    expand="block"
                    @click="enviarMensaje">
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
    IonList
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
            `http://192.168.1.80:3000/chats/${chatId}/mensajes`,
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
        await fetch(
            `http://192.168.1.80:3000/chats/${chatId}/mensajes`,
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

        nuevoMensaje.value = '';
        await cargarMensajes();
    } catch (error) {
        console.error(error);
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
            `http://192.168.1.80:3000/chats/${chatId}/integrantes`,
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

//Para agregar nuevos integrantes
const agregarIntegrante = async (usuarioId: number) => {
    try {
        await fetch(
            `http://192.168.1.80:3000/chats/${chatId}/integrantes`,
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

        busqueda.value = '';
        usuariosEncontrados.value = [];
        await cargarIntegrantes();

    } catch (error) {
        console.error(error);
    }
};

// Para eliminar integrantes
const eliminarIntegrante = async (usuarioId: number) => {
    try {
        await fetch(
            `http://192.168.1.80:3000/chats/${chatId}/integrantes/${usuarioId}`,
            {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        await cargarIntegrantes();
    } catch (error) {
        console.error(error);
    }
};

//Para cambiar el nombre al grupo
const cambiarNombre = async () => {
    if (!nuevoNombre.value) return;

    try {
        await fetch(
            `http://192.168.1.80:3000/chats/${chatId}/nombre`,
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

        nuevoNombre.value = '';
    } catch (error) {
        console.error(error);
    }
};

//Para eliminar el chat
const eliminarChat = async () => {
    try {
        await fetch(
            `http://192.168.1.80:3000/chats/${chatId}`,
            {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        router.push('/grupos');

    } catch (error) {
        console.error(error);
    }
};

onUnmounted(() => {
    clearInterval(intervalMensajes);
});
</script>