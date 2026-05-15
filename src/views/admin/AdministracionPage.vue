<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start"> 
                    <ion-menu-button></ion-menu-button> 
                </ion-buttons> 
                <ion-title>
                    Administracion
                </ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
            <p v-if="usuarios.length === 0">
                No hay usuarios pendientes
            </p>

            <ion-card
                v-for="usuario in usuarios"
                :key="usuario.id">

                <ion-card-header>
                    <ion-card-title>
                        {{ usuario.username }}
                    </ion-card-title>
                </ion-card-header>

                <ion-card-content>
                    <p>
                        Rol: {{ usuario.rol }}
                    </p>

                    <p v-if="usuario.grado">
                        Grado: {{ usuario.grado }}
                    </p>

                    <p v-if="usuario.grupo">
                        Grupo: {{ usuario.grupo }}
                    </p>

                    <ion-button
                        expand="block"
                        color="success"
                        class="input-space"
                        @click="aprobar(usuario.id)">
                        Aprobar
                    </ion-button>

                    <ion-button
                        expand="block"
                        color="danger"
                        class="input-space"
                        @click="rechazar(usuario.id)">
                        Rechazar
                    </ion-button>

                    <ion-select
                        label="Cambiar rol"
                        placeholder="Selecciona nuevo rol"
                        fill="outline"
                        class="input-space"
                        @ionChange="
                            cambiarRol(
                                usuario.id,
                                $event.detail.value
                            )
                        ">

                        <ion-select-option value="alumno">
                            Alumno
                        </ion-select-option>

                        <ion-select-option value="profesor">
                            Profesor
                        </ion-select-option>

                        <ion-select-option value="admin">
                            Admin
                        </ion-select-option>
                    </ion-select>

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
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonSelect,
    IonSelectOption
} from '@ionic/vue';

import { ref, onMounted } from 'vue';

const usuarios = ref<any[]>([]);
const token = localStorage.getItem('token');

const cargarUsuarios = async () => {
    try {
        const res = await fetch(
            'http://192.168.1.80:3000/admin/pendientes',
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        usuarios.value = await res.json();
    } catch (error) {
        console.error(error);
    }
};

const aprobar = async (id: number) => {
    try {
        await fetch(
            `http://192.168.1.80:3000/admin/aprobar/${id}`,
            {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
            
        );
        cargarUsuarios();
    } catch (error) {
        console.error(error);
    }
};

const rechazar = async (id: number) => {
    try {
        await fetch(
            `http://192.168.1.80:3000/admin/rechazar/${id}`,
            {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
            
        );
        cargarUsuarios();
    } catch (error) {
        console.error(error);
    }
};

const cambiarRol = async (
    id: number,
    rol: string
) => {
    try {
        await fetch(
            `http://192.168.1.80:3000/admin/cambiar-rol/${id}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    rol
                })
            }
        );

        cargarUsuarios();
    } catch (error) {
        console.error(error);
    }
};

onMounted(() => {
    cargarUsuarios();
});
</script>

<style scoped>
    .input-space {
        margin-top: 16px;
    }
</style>