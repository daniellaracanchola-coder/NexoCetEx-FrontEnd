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

            <ion-button
                :fill="seccion === 'solicitudes-perfil' ? 'solid' : 'outline'"
                @click="abrirSolicitudesPerfil">
                Cambios de perfil
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
                            <ion-badge v-if="esSuperAdmin(usuario)" color="primary">
                                Protegido
                            </ion-badge>
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

                    <p v-if="esSuperAdmin(usuario)" class="muted-text">
                        Cuenta principal: no se puede eliminar ni cambiar su nombre o rol.
                    </p>

                    <ion-select
                        v-if="!modoOffline && !esSuperAdmin(usuario)"
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

                    <div v-if="!modoOffline && !esSuperAdmin(usuario)" class="btn-group btn-group--card">
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
                        <ion-badge v-if="esSuperAdmin(usuario)" color="primary">
                            Protegido
                        </ion-badge>
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

                    <p v-if="esSuperAdmin(usuario)" class="muted-text">
                        Cuenta principal: no se puede eliminar ni cambiar su nombre o rol.
                    </p>

                    <ion-select
                        v-if="!modoOffline && !esSuperAdmin(usuario)"
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
                    <template v-if="usuario.rol === 'alumno' && !modoOffline && !esSuperAdmin(usuario)">
                        <ion-input
                            v-model="usuario._editUsername"
                            label="Nombre de usuario"
                            fill="outline"
                            class="input-space"
                        />
                        <ion-select
                            v-model="usuario._editGrado"
                            label="Grado"
                            fill="outline"
                            class="input-space"
                        >
                            <ion-select-option
                                v-for="g in gradosOpciones"
                                :key="g"
                                :value="g"
                            >{{ g }}</ion-select-option>
                        </ion-select>
                        <ion-select
                            v-model="usuario._editGrupo"
                            label="Grupo"
                            fill="outline"
                            class="input-space"
                        >
                            <ion-select-option
                                v-for="g in gruposOpciones"
                                :key="g"
                                :value="g"
                            >{{ g }}</ion-select-option>
                        </ion-select>
                        <div class="btn-solo">
                            <ion-button @click="guardarPerfilAlumno(usuario)">
                                Guardar grado / grupo / nombre
                            </ion-button>
                        </div>
                    </template>

                    <template v-if="usuario.rol === 'admin' && usuario.id === usuarioActual.id && !modoOffline && !esSuperAdmin(usuario)">
                        <ion-input
                            v-model="usuario._editUsername"
                            label="Tu nombre de usuario"
                            fill="outline"
                            class="input-space"
                        />
                        <div class="btn-solo">
                            <ion-button @click="guardarPerfilAlumno(usuario)">
                                Guardar mi perfil
                            </ion-button>
                        </div>
                    </template>

                    <div v-if="!modoOffline && usuario.id !== usuarioActual.id && !esSuperAdmin(usuario)" class="btn-solo">
                      <ion-button color="danger" @click="darBaja(usuario.id)">
                        Dar de baja
                      </ion-button>
                    </div>
                    </ion-card-content>
                </ion-card>
            </div>

            <div v-if="seccion === 'solicitudes-perfil'">
                <p v-if="solicitudesPerfil.length === 0">
                    No hay solicitudes de cambio de perfil pendientes
                </p>

                <ion-card
                    v-for="sol in solicitudesPerfil"
                    :key="sol.id"
                >
                    <ion-card-header>
                        <ion-card-title>{{ sol.username_actual }}</ion-card-title>
                    </ion-card-header>
                    <ion-card-content>
                        <p v-if="sol.username_nuevo">
                            Nuevo nombre: <strong>{{ sol.username_nuevo }}</strong>
                            (antes: {{ sol.username_actual }})
                        </p>
                        <p v-if="sol.grado_nuevo != null">
                            Nuevo grado: <strong>{{ sol.grado_nuevo }}</strong>
                            (antes: {{ sol.grado_actual }})
                        </p>
                        <p v-if="sol.grupo_nuevo">
                            Nuevo grupo: <strong>{{ sol.grupo_nuevo }}</strong>
                            (antes: {{ sol.grupo_actual }})
                        </p>
                        <p class="muted-text">
                            {{ new Date(sol.fecha_solicitud).toLocaleString() }}
                        </p>
                        <div v-if="!modoOffline && !esSuperAdmin({ username: sol.username_actual })" class="btn-group btn-group--card">
                            <ion-button color="success" @click="aprobarSolicitudPerfil(sol.id)">
                                Aprobar
                            </ion-button>
                            <ion-button color="medium" @click="rechazarSolicitudPerfil(sol.id)">
                                Rechazar
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
    IonInput,
    IonBadge,
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
import { sincronizarUsuarioLocal } from '@/services/perfil';
import { GRADOS_OPCIONES, GRUPOS_OPCIONES } from '@/utils/perfilOpciones';
import { esSuperAdmin } from '@/utils/superAdmin';

const gradosOpciones = GRADOS_OPCIONES;
const gruposOpciones = GRUPOS_OPCIONES;

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
    const usuario = usuariosPendientes.value.find((u) => u.id === id);
    if (usuario && esSuperAdmin(usuario)) {
        await mostrarToast('SuperAdmin no puede eliminarse', 'warning');
        return;
    }
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
    const usuario = usuariosActuales.value.find((u) => u.id === id)
        || usuariosPendientes.value.find((u) => u.id === id);
    if (usuario && esSuperAdmin(usuario)) {
        await mostrarToast('El rol de SuperAdmin no puede cambiarse', 'warning');
        return;
    }
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
const solicitudesPerfil = ref<any[]>([]);
const seccion = ref('pendientes');

function mapearUsuarioEdicion(u: any) {
  return {
    ...u,
    _editUsername: u.username,
    _editGrado: u.grado != null ? String(u.grado) : '',
    _editGrupo: u.grupo || '',
  };
}

const abrirSolicitudesPerfil = () => {
  seccion.value = 'solicitudes-perfil';
  cargarSolicitudesPerfil();
};

const cargarSolicitudesPerfil = async () => {
  try {
    const res = await fetch(
      'https://backend-nexo.onrender.com/admin/solicitudes-perfil',
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) return;
    solicitudesPerfil.value = await res.json();
  } catch (e) {
    console.error(e);
  }
};

const guardarPerfilAlumno = async (usuario: any) => {
    if (esSuperAdmin(usuario)) {
        await mostrarToast('Esta cuenta no puede modificarse', 'warning');
        return;
    }
    if (bloquearSiOffline()) return;
  try {
    const body: Record<string, string> = {
      username: usuario._editUsername,
    };
    if (usuario.rol === 'alumno') {
      body.grado = usuario._editGrado;
      body.grupo = usuario._editGrupo;
    }
    const res = await fetch(
      `https://backend-nexo.onrender.com/admin/usuarios/${usuario.id}/perfil`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }
    );
    const data = await res.json();
    if (!res.ok) {
      await mostrarToast(data.mensaje || 'No se pudo guardar', 'danger');
      return;
    }
    if (usuario.id === usuarioActual.id) {
      sincronizarUsuarioLocal(data.perfil);
    }
    await cargarUsuariosActuales();
    await mostrarToast('Perfil actualizado', 'success');
  } catch {
    await mostrarToast('Error de conexión', 'danger');
  }
};

const aprobarSolicitudPerfil = async (id: number) => {
  if (bloquearSiOffline()) return;
  try {
    const res = await fetch(
      `https://backend-nexo.onrender.com/admin/solicitudes-perfil/${id}/aprobar`,
      { method: 'PUT', headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    if (!res.ok) {
      await mostrarToast(data.mensaje || 'Error al aprobar', 'danger');
      return;
    }
    await cargarSolicitudesPerfil();
    await cargarUsuariosActuales();
    await mostrarToast('Solicitud aprobada', 'success');
  } catch {
    await mostrarToast('Error de conexión', 'danger');
  }
};

const rechazarSolicitudPerfil = async (id: number) => {
  if (bloquearSiOffline()) return;
  try {
    const res = await fetch(
      `https://backend-nexo.onrender.com/admin/solicitudes-perfil/${id}/rechazar`,
      { method: 'PUT', headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) {
      await mostrarToast('No se pudo rechazar', 'danger');
      return;
    }
    await cargarSolicitudesPerfil();
    await mostrarToast('Solicitud rechazada', 'success');
  } catch {
    await mostrarToast('Error de conexión', 'danger');
  }
};

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
    const usuario = usuariosActuales.value.find((u) => u.id === id);
    if (usuario && esSuperAdmin(usuario)) {
        await mostrarToast('SuperAdmin no puede darse de baja', 'warning');
        return;
    }
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
        usuariosActuales.value = resultado.data.map(mapearUsuarioEdicion);
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