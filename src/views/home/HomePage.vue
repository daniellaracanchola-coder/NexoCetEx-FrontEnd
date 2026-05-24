<template> 
  <ion-page :class="{ 'vista-solo-lectura': modoOffline }"> 
    <ion-header :translucent="true"> 
      <AppPageHeader title="Muro" /> 
    </ion-header> 

    <ion-content :fullscreen="true" class="avisos">
      <BannerOffline :activo="modoOffline" :fecha="fechaRespaldo" />

      <div id="container">
        <p class="page-intro">
          En esta sección verás los anuncios.
          <strong> Es necesario marcarlos como vistos </strong>
          para confirmar que recibiste la información.
        </p>
        <img
          src="@/assets/Avisos.png"
          alt="Avisos"
          style="height: 56px; display: block; margin: 12px auto;"
        />
      </div>
      <div>
        <div class="btn-solo" v-if="!modoOffline && (usuario?.rol === 'admin' || usuario?.rol === 'profesor')">
          <ion-button @click="abrirMFun">Crear anuncios</ion-button>
        </div>
        <ion-modal :is-open="abrirM">
          <ion-header>
            <ion-toolbar>
              <ion-title>Nuevo anuncio</ion-title>
            </ion-toolbar>
          </ion-header>

          <ion-content class="ion-padding">

            <ion-input 
              v-model="nuevoTit" 
              placeholder="Título"
              @ionInput="errorA = ''">
            </ion-input>
            <ion-textarea 
              v-model="nuevoConte" 
              placeholder="Contenido"
              @ionInput="errorA = ''">
            </ion-textarea>
            <ion-item>
              <ion-label>Dirigido a:</ion-label>
              <ion-select
              v-model="rolDes" placeholder="Elige a quién:">
                <ion-select-option value="todos">Todos</ion-select-option>
                <ion-select-option value="alumno">Alumnos</ion-select-option>
                <ion-select-option value="profesor">Profesores</ion-select-option>
              </ion-select>
            </ion-item>

            <template v-if="rolDes === 'alumno'">
              <ion-item>
                <ion-label>Grado (opcional)</ion-label>
                <ion-select v-model="gradoDes" placeholder="Todos los grados">
                  <ion-select-option value="todos">Todos los grados</ion-select-option>
                  <ion-select-option v-for="g in gradosOpciones" :key="g" :value="g">
                    {{ g }}°
                  </ion-select-option>
                </ion-select>
              </ion-item>
              <ion-item>
                <ion-label>Grupo (opcional)</ion-label>
                <ion-select v-model="grupoDes" placeholder="Todos los grupos">
                  <ion-select-option value="todos">Todos los grupos</ion-select-option>
                  <ion-select-option v-for="g in gruposOpciones" :key="g" :value="g">
                    Grupo {{ g }}
                  </ion-select-option>
                </ion-select>
              </ion-item>
            </template>

            <div class="btn-group btn-group--modal">
              <ion-button @click="guardarA">Publicar</ion-button>
              <ion-button color="medium" @click="abrirM = false">Cancelar</ion-button>
            </div>
            <p v-if="errorA" class="error-text">{{ errorA }}</p>
          </ion-content>
        </ion-modal>

        <ion-card 
            v-for="anuncio in filtro" 
            :key="anuncio.id"
            :class="{
                'aviso-importante': anuncio.tipo === 'importante',
                'aviso-no-leido': !anuncio.vistosPor?.includes(usuario?.username),
                'aviso-leido': anuncio.vistosPor?.includes(usuario?.username)
            }"
            >

          <ion-card-header>
            <ion-card-title>
              {{ anuncio.titulo}}
              <ion-badge
              color="danger" 
              v-if="anuncio.tipo === 'importante'">
                Importante
              </ion-badge>
            </ion-card-title>
          </ion-card-header>

          <ion-card-content>
            <TextoConEnlaces :texto="anuncio.conte" tag="div" class="aviso-contenido" />
            <ion-badge color="medium"
            v-if="anuncio.rolDes !== 'todos'">
              {{ anuncio.rolDes }}
            </ion-badge>
            <ion-badge
              color="tertiary"
              v-if="etiquetaDestino(anuncio)"
            >
              {{ etiquetaDestino(anuncio) }}
            </ion-badge>

            <ion-badge
              color="warning"
              v-if="!anuncio.vistosPor?.includes(usuario?.username)">
              Nuevo
            </ion-badge>
            
            <ion-badge 
              color="success"
              v-if="anuncio.vistosPor?.includes(usuario?.username)">
              Leído 
            </ion-badge>
            
            <div v-if="usuario?.rol === 'admin'" class="admin-aviso-meta">
              <p v-if="anuncio.pendientesLectura > 0" class="muted-text">
                {{ anuncio.pendientesLectura }} usuario(s) sin marcar como leído
              </p>
              <p class="muted-text">Leído por:</p>
              <ion-badge
                v-for="user in anuncio.vistosPor || []"
                :key="user"
                color="primary"
                style="margin-right:5px;">
                {{ user }}
              </ion-badge>
              <p v-if="anuncio.sinLeer?.length" class="muted-text">Pendientes:</p>
              <ion-badge
                v-for="user in anuncio.sinLeer || []"
                :key="'pendiente-' + user"
                color="warning"
                style="margin-right:5px;">
                {{ user }}
              </ion-badge>
            </div>

            <p v-if="anuncio.fecha" class="muted-text">
              {{ new Date(anuncio.fecha).toLocaleString() }}
            </p>

          </ion-card-content>

          <div v-if="!modoOffline" class="btn-group btn-group--card">
            <ion-button
              color="danger"
              v-if="usuario?.rol === 'admin' ||
              (usuario?.rol === 'profesor' && anuncio.autor === usuario?.username)"
              @click="eliminarAnun(anuncio.id)">
              Eliminar
            </ion-button>

            <ion-button
              v-if="!anuncio.vistosPor?.includes(usuario?.username)"
              @click="anunLeido(anuncio)">
              Marcar como leído
            </ion-button>

            <ion-button
              v-if="usuario?.rol === 'admin' && anuncio.pendientesLectura > 0"
              color="tertiary"
              @click="recordarLectura(anuncio)">
              Recordar lectura
            </ion-button>

            <ion-button
              v-if="usuario?.rol === 'admin' ||
              (usuario?.rol === 'profesor' && anuncio.autor === usuario?.username)"
              @click="cambiarTipo(anuncio)">
              {{ anuncio.tipo === 'importante' ? 'Quitar importancia' : 'Marcar importante' }}
            </ion-button>
          </div>

        </ion-card>
      </div>
    </ion-content>

    <AppContactFooter />
  </ion-page> 
</template> 

<script setup lang="ts">
import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonModal,
  IonToolbar,
  IonTitle,
  IonInput,
  IonTextarea,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonBadge,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption
} from '@ionic/vue'; 

import { ref, onMounted, computed, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { mostrarToast } from '@/services/feedback';
import AppPageHeader from '@/components/AppPageHeader.vue';
import TextoConEnlaces from '@/components/TextoConEnlaces.vue';
import BannerOffline from '@/components/BannerOffline.vue';
import AppContactFooter from '@/components/AppContactFooter.vue';
import {
  obtenerConCache,
  clavesCache,
  fetchJsonConAuth,
  formatearFechaRespaldo,
} from '@/services/cacheOffline';
import { usuarioVeAviso } from '@/services/perfil';
import {
  GRADOS_OPCIONES,
  GRUPOS_OPCIONES,
  etiquetaDestinoAviso,
} from '@/utils/perfilOpciones';

let intervalAvisos: ReturnType<typeof setInterval> | null = null;

const router = useRouter();

const usuario = ref<any>(null);

const abrirM = ref(false);
const nuevoTit = ref('');
const nuevoConte = ref('');

const rolDes = ref('todos');
const gradoDes = ref('todos');
const grupoDes = ref('todos');
const gradosOpciones = GRADOS_OPCIONES;
const gruposOpciones = GRUPOS_OPCIONES;

const etiquetaDestino = etiquetaDestinoAviso;

const anuncios = ref<any[]>([]);
const modoOffline = ref(false);
const fechaRespaldo = ref('');

const errorA = ref('');

const token = localStorage.getItem('token');

function bloquearSiOffline(): boolean {
  if (modoOffline.value) {
    void mostrarToast(
      'Sin conexión. Solo puedes ver los avisos guardados.',
      'warning'
    );
    return true;
  }
  return false;
}

const guardarA = async () => {
  if (bloquearSiOffline()) return;
  if (!nuevoTit.value || !nuevoConte.value) {
    errorA.value = 'Completa todos los datos';
    return;
  }

    try {
        const res = await fetch(
            'https://backend-nexo.onrender.com/avisos',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    titulo: nuevoTit.value,
                    conte: nuevoConte.value,
                    autor: usuario.value?.username,
                    rolDes: rolDes.value,
                    gradoDes: rolDes.value === 'alumno' ? gradoDes.value : null,
                    grupoDes: rolDes.value === 'alumno' ? grupoDes.value : null,
                })
            }
        );

        const data = await res.json();

        if (!res.ok) {
            errorA.value = data.mensaje;
            return;
        }

        await cargarAnun();

        nuevoTit.value = '';
        nuevoConte.value = '';
        rolDes.value = 'todos';
        gradoDes.value = 'todos';
        grupoDes.value = 'todos';
        errorA.value = '';
        abrirM.value = false;
        await mostrarToast('Anuncio publicado', 'success');
    } catch (error) {
        console.error(error);
        errorA.value = 'Error al conectar con el servidor';
    }
};

const eliminarAnun = async (id: number) => {
  if (bloquearSiOffline()) return;
  try {
    const res = await fetch(
        `https://backend-nexo.onrender.com/avisos/${id}`,
        {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    if (!res.ok) {
      await mostrarToast('No se pudo eliminar el anuncio', 'danger');
      return;
    }

    await cargarAnun();
    await mostrarToast('Anuncio eliminado', 'success');
  } catch (error) {
    console.error(error);
    await mostrarToast('Error al eliminar', 'danger');
  }
};

onMounted(() => {
  usuario.value = JSON.parse(
    localStorage.getItem('usuario') || 'null'
  );
  
  cargarAnun();

  intervalAvisos = setInterval(() => {
    cargarAnun();
  }, 5000);
});

onUnmounted(() => {
    if (intervalAvisos) clearInterval(intervalAvisos);
});

const anunLeido = async (anuncio: any) => {
    if (bloquearSiOffline()) return;
    try {
        const res = await fetch(
            `https://backend-nexo.onrender.com/avisos/${anuncio.id}/leido`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    username: usuario.value?.username
                })
            }
        );

        if (!res.ok) {
            await mostrarToast('No se pudo marcar como leído', 'danger');
            return;
        }

        await cargarAnun();
        await mostrarToast('Marcado como leído', 'success');
    } catch (error) {
        console.error(error);
        await mostrarToast('Error de conexión', 'danger');
    }
};

const recordarLectura = async (anuncio: any) => {
    if (bloquearSiOffline()) return;
    try {
        const res = await fetch(
            `https://backend-nexo.onrender.com/avisos/${anuncio.id}/recordar`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await res.json();

        if (!res.ok) {
            await mostrarToast(data.mensaje || 'No se pudo enviar el recordatorio', 'danger');
            return;
        }

        await mostrarToast(
            `Recordatorio enviado a ${data.enviados} usuario(s)`,
            'success'
        );
    } catch (error) {
        console.error(error);
        await mostrarToast('Error de conexión', 'danger');
    }
};

const abrirMFun = () => {
  errorA.value = '';
  abrirM.value = true;
};

const cambiarTipo = async (anuncio: any) => {
  if (bloquearSiOffline()) return;
  try {
    const res = await fetch(
        `https://backend-nexo.onrender.com/avisos/${anuncio.id}/tipo`,
        {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    if (!res.ok) {
      await mostrarToast('No se pudo actualizar la importancia', 'danger');
      return;
    }

    await cargarAnun();
    await mostrarToast('Importancia del anuncio actualizada', 'success');
  } catch (error) {
    console.error(error);
    await mostrarToast('Error de conexión', 'danger');
  }
};

const ordenarAnun = () => {
  anuncios.value.sort((a, b) => {
    if (a.tipo === 'importante' && b.tipo !== 'importante') return -1;
    if (a.tipo !== 'importante' && b.tipo === 'importante') return 1;
    return (new Date(b.fecha || 0).getTime() - new Date(a.fecha || 0).getTime());
  });
};

const cargarAnun = async () => {
  try {
    const resultado = await obtenerConCache(
      clavesCache.avisos(),
      () => fetchJsonConAuth<any[]>('https://backend-nexo.onrender.com/avisos', token)
    );
    anuncios.value = resultado.data;
    modoOffline.value = resultado.desdeCache;
    fechaRespaldo.value = resultado.fechaCache
      ? formatearFechaRespaldo(resultado.fechaCache)
      : '';
    ordenarAnun();
  } catch (error) {
    console.error(error);
    if (anuncios.value.length === 0) {
      modoOffline.value = false;
    }
  }
};

const filtro = computed(() => {
  return anuncios.value.filter((a) => usuarioVeAviso(usuario.value, a));
});

</script>
  
