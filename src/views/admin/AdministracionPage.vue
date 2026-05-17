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
            <ion-button @click="seccion = 'pendientes'">
                Pendientes
            </ion-button>

            <ion-button @click="seccion = 'usuarios'">
                Usuarios Actuales
            </ion-button>

            <div v-if="seccion === 'pendientes'">
                <p v-if="usuariosPendientes.length === 0">
                    No hay usuarios pendientes
                </p>

                <ion-card
                    v-for="usuario in usuariosPendientes"
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

                    <ion-select
                        label="Cambiar rol"
                        placeholder="Selecciona nuevo rol"
                        fill="outline"
                        class="input-space"
                        @ionChange="cambiarRol(usuario.id, $event.detail.value)">
                        
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
                </ion-card-content>
            </ion-card>
        </div>

        <div v-if="seccion === 'usuarios'">
            <p v-if="usuariosActuales.length === 0">
                No hay usuarios actualmente
            </p>

            <ion-card
                v-for="usuario in usuariosActuales"
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

                    <ion-select
                        label="Cambiar rol"
                        placeholder="Selecciona nuevo rol"
                        fill="outline"
                        class="input-space"
                        @ionChange="cambiarRol(usuario.id, $event.detail.value)">

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
                    <ion-button 
                        v-if="usuario.id !== usuarioActual.id"
                        expand="block"
                        color="danger"
                        class="input-space" 
                        @click="darBaja(usuario.id)">
                            Dar de baja
                        </ion-button>
                    </ion-card-content>
                </ion-card>
            </div>
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
    IonSelectOption,
    IonButtons,
    IonMenuButton
} from '@ionic/vue';

import { ref, onMounted } from 'vue';

const token = localStorage.getItem('token');
const usuarioActual = JSON.parse(
    localStorage.getItem('usuario') || '{}'
);

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
        cargarPendientes();
        cargarUsuariosActuales();
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
        cargarPendientes();
        cargarUsuariosActuales();
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

        cargarPendientes();
        cargarUsuariosActuales();
    } catch (error) {
        console.error(error);
    }
};

onMounted(() => {
    cargarPendientes();
    cargarUsuariosActuales();
});

const usuariosPendientes = ref<any[]>([]);
const usuariosActuales = ref<any[]>([]);
const seccion = ref('pendientes');

const cargarPendientes = async () => {
    const res = await fetch(
        'http://192.168.1.80:3000/admin/pendientes',
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    usuariosPendientes.value = await res.json();
};

const darBaja = async (id: number) => {
    await fetch(
        `http://192.168.1.80:3000/admin/baja/${id}`,
        {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    cargarUsuariosActuales();
}

const cargarUsuariosActuales = async () => {
    const res = await fetch(
        'http://192.168.1.80:3000/admin/usuarios',
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    usuariosActuales.value = await res.json();
};

</script>

<style scoped>
    .input-space {
        margin-top: 16px;
    }
</style>