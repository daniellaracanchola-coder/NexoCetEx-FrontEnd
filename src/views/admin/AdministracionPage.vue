<template>
    <ion-page>
        <ion-header>
            <AppPageHeader title="Administración" :show-logo="false" :show-brand="false" />
        </ion-header>
        
        <ion-content class="ion-padding" :class="{ 'vista-solo-lectura': modoOffline }">
            <BannerOffline :activo="modoOffline" :fecha="fechaRespaldo" />
            <div class="admin-tabs">
            <ion-button
                :fill="seccion === 'pendientes' ? 'solid' : 'outline'"
                @click="seccion = 'pendientes'">
                Pendientes
            </ion-button>

            <ion-button
                :fill="seccion === 'usuarios' ? 'solid' : 'outline'"
                @click="seccion = 'usuarios'">
                Usuarios actuales
            </ion-button>
            </div>

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
                        v-if="!modoOffline"
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

                    <div v-if="!modoOffline" class="btn-group btn-group--card">
                      <ion-button color="success" @click="aprobar(usuario.id)">
                        Aprobar
                      </ion-button>
                      <ion-button color="danger" @click="rechazar(usuario.id)">
                        Rechazar
                      </ion-button>
                    </div>    
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
                        v-if="!modoOffline"
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
                    <div v-if="!modoOffline && usuario.id !== usuarioActual.id" class="btn-solo">
                      <ion-button color="danger" @click="darBaja(usuario.id)">
                        Dar de baja
                      </ion-button>
                    </div>
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
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonSelect,
    IonSelectOption,
} from '@ionic/vue';

import { ref, onMounted } from 'vue';
import { mostrarToast } from '@/services/feedback';
import AppPageHeader from '@/components/AppPageHeader.vue';
import BannerOffline from '@/components/BannerOffline.vue';
import {
    obtenerConCache,
    clavesCache,
    fetchJsonConAuth,
    formatearFechaRespaldo,
} from '@/services/cacheOffline';

const token = localStorage.getItem('token');
const modoOffline = ref(false);
const fechaRespaldo = ref('');

function bloquearSiOffline(): boolean {
    if (modoOffline.value) {
        void mostrarToast(
            'Sin conexión. Solo puedes ver la lista guardada.',
            'warning'
        );
        return true;
    }
    return false;
}
const usuarioActual = JSON.parse(
    localStorage.getItem('usuario') || '{}'
);

const aprobar = async (id: number) => {
    if (bloquearSiOffline()) return;
    try {
        const res = await fetch(
            `https://backend-nexo.onrender.com/admin/aprobar/${id}`,
            {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        if (!res.ok) {
            await mostrarToast('No se pudo aprobar el usuario', 'danger');
            return;
        }
        await cargarPendientes();
        await cargarUsuariosActuales();
        await mostrarToast('Usuario aprobado', 'success');
    } catch (error) {
        console.error(error);
        await mostrarToast('Error de conexión', 'danger');
    }
};

const rechazar = async (id: number) => {
    if (bloquearSiOffline()) return;
    try {
        const res = await fetch(
            `https://backend-nexo.onrender.com/admin/rechazar/${id}`,
            {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        if (!res.ok) {
            await mostrarToast('No se pudo rechazar la solicitud', 'danger');
            return;
        }
        await cargarPendientes();
        await cargarUsuariosActuales();
        await mostrarToast('Solicitud rechazada', 'success');
    } catch (error) {
        console.error(error);
        await mostrarToast('Error de conexión', 'danger');
    }
};

const cambiarRol = async (
    id: number,
    rol: string
) => {
    if (bloquearSiOffline()) return;
    try {
        const res = await fetch(
            `https://backend-nexo.onrender.com/admin/cambiar-rol/${id}`,
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

        if (!res.ok) {
            await mostrarToast('No se pudo cambiar el rol', 'danger');
            return;
        }

        await cargarPendientes();
        await cargarUsuariosActuales();
        await mostrarToast('Rol actualizado', 'success');
    } catch (error) {
        console.error(error);
        await mostrarToast('Error de conexión', 'danger');
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
    try {
        const resultado = await obtenerConCache(
            clavesCache.adminPendientes(),
            () =>
                fetchJsonConAuth<any[]>(
                    'https://backend-nexo.onrender.com/admin/pendientes',
                    token
                )
        );
        usuariosPendientes.value = resultado.data;
        modoOffline.value = resultado.desdeCache;
        fechaRespaldo.value = resultado.fechaCache
            ? formatearFechaRespaldo(resultado.fechaCache)
            : '';
    } catch (error) {
        console.error(error);
    }
};

const darBaja = async (id: number) => {
    if (bloquearSiOffline()) return;
    try {
        const res = await fetch(
            `https://backend-nexo.onrender.com/admin/baja/${id}`,
            {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        if (!res.ok) {
            await mostrarToast('No se pudo dar de baja al usuario', 'danger');
            return;
        }
        await cargarUsuariosActuales();
        await mostrarToast('Usuario dado de baja', 'success');
    } catch (error) {
        console.error(error);
        await mostrarToast('Error de conexión', 'danger');
    }
};

const cargarUsuariosActuales = async () => {
    try {
        const resultado = await obtenerConCache(
            clavesCache.adminUsuarios(),
            () =>
                fetchJsonConAuth<any[]>(
                    'https://backend-nexo.onrender.com/admin/usuarios',
                    token
                )
        );
        usuariosActuales.value = resultado.data;
        if (resultado.desdeCache) {
            modoOffline.value = true;
            if (resultado.fechaCache) {
                fechaRespaldo.value = formatearFechaRespaldo(resultado.fechaCache);
            }
        }
    } catch (error) {
        console.error(error);
    }
};

</script>

<style scoped>
    .input-space {
        margin-top: 16px;
    }
</style>