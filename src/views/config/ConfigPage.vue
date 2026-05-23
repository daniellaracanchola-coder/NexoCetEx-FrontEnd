<template>
  <ion-page>
    <ion-header>
      <AppPageHeader title="Configuración" />
    </ion-header>

    <ion-content class="conf">
      <p class="page-intro">
        Aquí puedes elegir y configurar los detalles de la app.
      </p>
      <ion-card>
        <ion-card-header>
            <ion-card-title>Apariencia</ion-card-title>
        </ion-card-header>

        <ion-card-content>
            <ion-select
                v-model="tema"
                label="Tema"
                fill="outline">
                <ion-select-option value="sistema">Según el sistema</ion-select-option>
                <ion-select-option value="claro">Modo claro</ion-select-option>
                <ion-select-option value="oscuro">Modo oscuro</ion-select-option>
                <ion-select-option value="extra">Mensajería (morado)</ion-select-option>
            </ion-select>
        </ion-card-content>
      </ion-card>

      <ion-card>
        <ion-card-header>
            <ion-card-title>Accesibilidad</ion-card-title>
        </ion-card-header>

        <ion-card-content>
            <ion-select
                v-model="tamanoLetra"
                label="Tamaño de letra"
                fill="outline">
                <ion-select-option value="normal">Por defecto</ion-select-option>
                <ion-select-option value="grande">Grande</ion-select-option>
                <ion-select-option value="muy-grande">Muy grande</ion-select-option>
            </ion-select>

            <ion-toggle 
                v-model="altoContraste">
                Alto contraste
            </ion-toggle>
        </ion-card-content>
      </ion-card>

      <ion-card>
        <ion-card-header>
            <ion-card-title>Mi perfil</ion-card-title>
        </ion-card-header>
        <ion-card-content>
            <p class="muted-text" v-if="perfilActual">
              Usuario actual: <strong>{{ perfilActual.username }}</strong>
              <span v-if="perfilActual.rol === 'alumno'">
                · Grado {{ perfilActual.grado }} · Grupo {{ perfilActual.grupo }}
              </span>
            </p>

            <p v-if="solicitudPendiente" class="aviso-pendiente-perfil">
              Tienes una solicitud pendiente de revisión por un administrador.
            </p>

            <ion-input
              v-model="perfilUsername"
              label="Nombre de usuario"
              fill="outline"
              :readonly="esAlumno && !!solicitudPendiente"
            />

            <template v-if="perfilActual?.rol === 'alumno'">
              <ion-select v-model="perfilGrado" label="Grado" fill="outline">
                <ion-select-option
                  v-for="g in gradosOpciones"
                  :key="g"
                  :value="g"
                >{{ g }}</ion-select-option>
              </ion-select>
              <ion-select v-model="perfilGrupo" label="Grupo" fill="outline">
                <ion-select-option
                  v-for="g in gruposOpciones"
                  :key="g"
                  :value="g"
                >{{ g }}</ion-select-option>
              </ion-select>
            </template>

            <div class="btn-solo">
              <ion-button
                v-if="esAdmin"
                @click="guardarPerfilDirecto"
              >
                Guardar perfil
              </ion-button>
              <ion-button
                v-else-if="esAlumno"
                :disabled="!!solicitudPendiente"
                @click="solicitarCambioPerfil"
              >
                Solicitar cambio
              </ion-button>
            </div>
            <p v-if="mensajePerfil" class="error-text">{{ mensajePerfil }}</p>
        </ion-card-content>
      </ion-card>

      <ion-card>
        <ion-card-header>
            <ion-card-title>Chat y avisos</ion-card-title>
        </ion-card-header>

        <ion-card-content>
            <ion-toggle
                v-model="notificaciones">
                Recibir notificaciones
            </ion-toggle>
        </ion-card-content>
      </ion-card>

        <ion-card>
            <ion-card-header>
                <ion-card-title>Cambiar contraseña</ion-card-title>
            </ion-card-header>

            <ion-card-content>
                <ion-input
                    v-model="passwordActual"
                    type="password"
                    placeholder="Contraseña actual"
                    fill="outline">
                </ion-input>

                <ion-input
                    v-model="passwordNueva"
                    type="password"
                    placeholder="Nueva contraseña"
                    fill="outline">
                </ion-input>

                <div class="btn-solo">
                  <ion-button @click="cambiarPassword">Cambiar contraseña</ion-button>
                </div>

                <p v-if="mensajePassword" class="error-text">
                    {{ mensajePassword }}
                </p>
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
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonSelect,
  IonSelectOption,
  IonToggle,
  IonCardTitle,
  IonInput,
  IonButton
} from '@ionic/vue';

import { ref, watch, onMounted, computed } from 'vue';

import {
    aplicarConfiguracion,
    normalizarTema,
    type TemaPreferencia,
} from '@/services/configuracion';
import { mostrarToast } from '@/services/feedback';
import AppPageHeader from '@/components/AppPageHeader.vue';
import { sincronizarUsuarioLocal } from '@/services/perfil';
import { GRADOS_OPCIONES, GRUPOS_OPCIONES } from '@/utils/perfilOpciones';

const gradosOpciones = GRADOS_OPCIONES;
const gruposOpciones = GRUPOS_OPCIONES;

const tema = ref<TemaPreferencia>('sistema');
const tamanoLetra = ref('normal');
const altoContraste = ref(false);
const notificaciones = ref(true); 

const cargandoConfig = ref(true);

const token = localStorage.getItem('token');
const usuarioLocal = JSON.parse(localStorage.getItem('usuario') || '{}');

const perfilActual = ref<any>(null);
const solicitudPendiente = ref<any>(null);
const perfilUsername = ref('');
const perfilGrado = ref('');
const perfilGrupo = ref('');
const mensajePerfil = ref('');

const esAdmin = computed(() => perfilActual.value?.rol === 'admin');
const esAlumno = computed(() => perfilActual.value?.rol === 'alumno');

const cargarPerfil = async () => {
  try {
    const res = await fetch('https://backend-nexo.onrender.com/perfil/mi-perfil', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const data = await res.json();
    perfilActual.value = data.perfil;
    solicitudPendiente.value = data.solicitudPendiente;
    perfilUsername.value = data.perfil.username || '';
    perfilGrado.value = data.perfil.grado != null ? String(data.perfil.grado) : '';
    perfilGrupo.value = data.perfil.grupo || '';
    sincronizarUsuarioLocal(data.perfil);
  } catch (e) {
    console.error(e);
  }
};

const guardarPerfilDirecto = async () => {
  if (!esAdmin.value) return;
  mensajePerfil.value = '';
  try {
    const res = await fetch(
      `https://backend-nexo.onrender.com/admin/usuarios/${usuarioLocal.id}/perfil`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: perfilUsername.value,
        }),
      }
    );
    const data = await res.json();
    if (!res.ok) {
      mensajePerfil.value = data.mensaje || 'No se pudo guardar';
      await mostrarToast(mensajePerfil.value, 'danger');
      return;
    }
    perfilActual.value = data.perfil;
    sincronizarUsuarioLocal(data.perfil);
    await mostrarToast('Perfil actualizado', 'success');
  } catch {
    await mostrarToast('Error de conexión', 'danger');
  }
};

const solicitarCambioPerfil = async () => {
  mensajePerfil.value = '';
  try {
    const res = await fetch(
      'https://backend-nexo.onrender.com/perfil/solicitud-cambio',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: perfilUsername.value,
          grado: perfilGrado.value,
          grupo: perfilGrupo.value,
        }),
      }
    );
    const data = await res.json();
    if (!res.ok) {
      mensajePerfil.value = data.mensaje || 'No se pudo enviar';
      await mostrarToast(mensajePerfil.value, 'danger');
      return;
    }
    await mostrarToast(data.mensaje, 'success');
    await cargarPerfil();
  } catch {
    await mostrarToast('Error de conexión', 'danger');
  }
};

const cargarConfiguracion = async () => {
    try {
        const res = await fetch(
            'https://backend-nexo.onrender.com/config',
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const config = await res.json();

        tema.value = normalizarTema(config.tema);
        tamanoLetra.value = config.tamano_letra || 'normal';
        altoContraste.value = Boolean(config.alto_contraste);
        notificaciones.value = Boolean(config.notificaciones);

        aplicarConfiguracion({
            tema: tema.value,
            tamano_letra: tamanoLetra.value,
            alto_contraste: altoContraste.value
        });
    } catch (error) {
        console.error(error);
    }
    cargandoConfig.value = false;
};

const guardarConfiguracion = async () => {
    try{
        const res = await fetch(
            'https://backend-nexo.onrender.com/config',
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    tema: tema.value,
                    tamano_letra: tamanoLetra.value,
                    alto_contraste: altoContraste.value,
                    notificaciones: notificaciones.value
                })
            }
        );
        if (res.ok) {
            await mostrarToast('Preferencias guardadas', 'success', 2000);
        } else {
            await mostrarToast('No se pudo guardar en el servidor', 'danger');
        }
    } catch (error) {
        console.error(error);
        await mostrarToast('Error al guardar la configuración', 'danger');
    }
};

const passwordActual = ref('');
const passwordNueva = ref('');
const mensajePassword = ref('');

const cambiarPassword = async () => {
    try {
        const res = await fetch(
            'https://backend-nexo.onrender.com/config/cambiar-password',
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    passwordActual: passwordActual.value,
                    passwordNueva: passwordNueva.value
                })
            }
        );

        const data = await res.json();

        if (res.ok) {
            mensajePassword.value = data.mensaje || 'Contraseña actualizada';
            passwordActual.value = '';
            passwordNueva.value = '';
            await mostrarToast('Contraseña actualizada', 'success');
        } else {
            mensajePassword.value = data.mensaje || 'No se pudo cambiar la contraseña';
            await mostrarToast(mensajePassword.value, 'danger');
        }
    } catch (error) {
        console.error(error);
        mensajePassword.value = 'Error al conectar con el servidor';
        await mostrarToast(mensajePassword.value, 'danger');
    }
};

onMounted(() => {
    cargarPerfil();
    cargarConfiguracion();
});

watch(
    [tema, tamanoLetra, altoContraste, notificaciones],
    () => {
        aplicarConfiguracion({
            tema: tema.value,
            tamano_letra: tamanoLetra.value,
            alto_contraste: altoContraste.value
        });
        
        if (!cargandoConfig.value) {
            guardarConfiguracion();
        }
    }
);
</script>