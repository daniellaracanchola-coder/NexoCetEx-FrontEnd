<template>
  <ion-page>
    <ion-header>
      <AppPageHeader title="Nexo de ayuda" />
    </ion-header>

    <ion-content class="nexoA" :class="{ 'vista-solo-lectura': modoOffline }">
      <BannerOffline :activo="modoOffline" :fecha="fechaRespaldo" />
      <p class="page-intro">
        Centro de apoyo a estudiantes: comparte dudas escolares y recibe apoyo
        de otros alumnos o del personal.
      </p>

      <div class="duda-banner">
        <p>¿Tienes dudas?</p>
      </div>

      <div class="btn-solo" v-if="!modoOffline && usuario?.rol !== 'admin'">
        <ion-button @click="abrirModalNueva">Publicar una duda</ion-button>
      </div>

      <p v-if="recargaPausada" class="nexo-pausa-aviso">
        Actualización en pausa mientras escribes…
      </p>

      <ion-card
        v-for="dud in dudas"
        :key="dud.id"
        class="duda-card"
        :class="{
          'duda-card--revision': dud.revision,
          'duda-card--importante': dud.importancia && !dud.revision,
        }"
      >
        <ion-card-header class="duda-card__header">
          <div class="duda-card__meta">
            <span class="duda-card__autor">{{ dud.autor }}</span>
            <div class="duda-card__badges">
              <ion-badge v-if="dud.importancia" color="warning">Importante</ion-badge>
              <ion-badge v-if="dud.revision" color="danger">En revisión</ion-badge>
            </div>
          </div>
        </ion-card-header>

        <ion-card-content>
          <p class="duda-card__pregunta">{{ dud.conte }}</p>

          <div
            v-if="dud.respuestas?.length"
            class="duda-respuestas"
          >
            <p class="duda-respuestas__titulo">
              {{ dud.respuestas.length }}
              {{ dud.respuestas.length === 1 ? 'respuesta' : 'respuestas' }}
            </p>
            <div
              v-for="(resp, idx) in dud.respuestas"
              :key="`${dud.id}-resp-${idx}-${resp.fecha || ''}`"
              class="duda-respuesta"
            >
              <strong>{{ resp.autor }}</strong>
              <p>{{ resp.conte }}</p>
              <small v-if="resp.fecha">{{ formatearFecha(resp.fecha) }}</small>
            </div>
          </div>

          <div
            v-if="!modoOffline && dud.mostrarRespuesta"
            class="duda-responder"
          >
            <ion-textarea
              v-model="dud.nuevaRespues"
              placeholder="Escribe tu respuesta…"
              fill="outline"
              :auto-grow="true"
              :rows="3"
              @ionFocus="marcarEscribiendo(true)"
              @ionBlur="marcarEscribiendo(false)"
            />
          </div>

          <div v-if="!modoOffline" class="btn-group btn-group--card">
            <ion-button
              :fill="dud.mostrarRespuesta ? 'solid' : 'outline'"
              @click="toggleResponder(dud)"
            >
              {{ dud.mostrarRespuesta ? 'Ocultar' : 'Ayudar' }}
            </ion-button>
            <ion-button
              v-if="dud.mostrarRespuesta"
              @click="responder(dud)"
            >
              Enviar
            </ion-button>
            <ion-button
              v-if="usuario?.rol === 'profesor'"
              fill="outline"
              @click="toggleRevision(dud)"
            >
              Favor de revisar
            </ion-button>
            <ion-button
              v-if="usuario?.rol === 'profesor'"
              fill="outline"
              @click="toggleImportant(dud)"
            >
              Marcar importante
            </ion-button>
            <ion-button
              v-if="usuario?.rol === 'admin'"
              color="danger"
              @click="eliminar(dud.id)"
            >
              Eliminar
            </ion-button>
          </div>
        </ion-card-content>
      </ion-card>

      <ion-modal :is-open="abrirM" @didDismiss="cerrarModal">
        <ion-header>
          <ion-toolbar>
            <ion-title>Nueva duda</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="cerrarModal">Cerrar</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-textarea
            v-model="nuevaDuda"
            placeholder="¿Cuál es tu duda?"
            fill="outline"
            :auto-grow="true"
            :rows="4"
            @ionFocus="marcarEscribiendo(true)"
            @ionBlur="marcarEscribiendo(false)"
          />
          <div class="btn-group btn-group--modal">
            <ion-button @click="crearDuda">Publicar</ion-button>
            <ion-button color="medium" fill="outline" @click="cerrarModal">
              Cancelar
            </ion-button>
          </div>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonContent,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonModal,
  IonTextarea,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonBadge,
} from '@ionic/vue';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { mostrarToast } from '@/services/feedback';
import AppPageHeader from '@/components/AppPageHeader.vue';
import BannerOffline from '@/components/BannerOffline.vue';
import {
  obtenerConCache,
  clavesCache,
  fetchJsonConAuth,
  formatearFechaRespaldo,
} from '@/services/cacheOffline';

interface RespuestaDuda {
  autor: string;
  conte: string;
  fecha?: string;
}

interface DudaUi {
  id: number;
  autor: string;
  conte: string;
  importancia?: boolean;
  revision?: boolean;
  respuestas: RespuestaDuda[];
  mostrarRespuesta: boolean;
  nuevaRespues: string;
}

let intervalDudas: ReturnType<typeof setInterval> | null = null;

const abrirM = ref(false);
const dudas = ref<DudaUi[]>([]);
const nuevaDuda = ref('');
const usuario = ref<{ username?: string; rol?: string } | null>(null);
const escribiendoEnCampo = ref(false);
const modoOffline = ref(false);
const fechaRespaldo = ref('');

function bloquearSiOffline(): boolean {
  if (modoOffline.value) {
    void mostrarToast(
      'Sin conexión. Solo puedes ver las dudas guardadas.',
      'warning'
    );
    return true;
  }
  return false;
}

const hayTextoEnRespuestas = computed(() =>
  dudas.value.some((d) => d.nuevaRespues.trim().length > 0)
);

const recargaPausada = computed(
  () =>
    escribiendoEnCampo.value ||
    abrirM.value ||
    hayTextoEnRespuestas.value ||
    dudas.value.some((d) => d.mostrarRespuesta)
);

const formatearFecha = (fecha: string) => {
  try {
    return new Date(fecha).toLocaleString();
  } catch {
    return '';
  }
};

const marcarEscribiendo = (activo: boolean) => {
  escribiendoEnCampo.value = activo;
};

const hayEscrituraActiva = () => recargaPausada.value;

/** Conserva lo que el usuario estaba escribiendo al actualizar desde el servidor */
const fusionarEstadoUi = (
  previas: DudaUi[],
  desdeApi: Omit<DudaUi, 'mostrarRespuesta' | 'nuevaRespues'>[]
): DudaUi[] => {
  const mapa = new Map(
    previas.map((d) => [
      d.id,
      { mostrarRespuesta: d.mostrarRespuesta, nuevaRespues: d.nuevaRespues },
    ])
  );

  return desdeApi.map((d) => {
    const guardado = mapa.get(d.id);
    return {
      ...d,
      respuestas: d.respuestas || [],
      mostrarRespuesta: guardado?.mostrarRespuesta ?? false,
      nuevaRespues: guardado?.nuevaRespues ?? '',
    };
  });
};

const cargarDudas = async (forzar = false) => {
  if (!forzar && hayEscrituraActiva()) {
    return;
  }

  try {
    const resultado = await obtenerConCache(
      clavesCache.dudas(),
      () => fetchJsonConAuth<any[]>('https://backend-nexo.onrender.com/dudas', null)
    );
    dudas.value = fusionarEstadoUi(dudas.value, resultado.data);
    modoOffline.value = resultado.desdeCache;
    fechaRespaldo.value = resultado.fechaCache
      ? formatearFechaRespaldo(resultado.fechaCache)
      : '';
  } catch (error) {
    console.error('Error al cargar dudas:', error);
  }
};

const abrirModalNueva = () => {
  abrirM.value = true;
};

const cerrarModal = () => {
  abrirM.value = false;
  nuevaDuda.value = '';
  marcarEscribiendo(false);
};

const toggleResponder = (dud: DudaUi) => {
  dud.mostrarRespuesta = !dud.mostrarRespuesta;
  if (!dud.mostrarRespuesta) {
    dud.nuevaRespues = '';
  }
};

onMounted(async () => {
  const userData = localStorage.getItem('usuario');
  if (userData) {
    usuario.value = JSON.parse(userData);
  }

  await cargarDudas(true);
  intervalDudas = setInterval(() => cargarDudas(false), 8000);
});

onUnmounted(() => {
  if (intervalDudas) clearInterval(intervalDudas);
});

const crearDuda = async () => {
  if (!nuevaDuda.value.trim()) return;
  if (bloquearSiOffline()) return;
  try {
    const res = await fetch('https://backend-nexo.onrender.com/dudas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conte: nuevaDuda.value.trim(),
        autor: usuario.value?.username || 'anonimo',
      }),
    });

    if (!res.ok) {
      throw new Error('Error al crear duda');
    }

    const data = await res.json();
    dudas.value.unshift({
      ...data,
      respuestas: data.respuestas || [],
      mostrarRespuesta: false,
      nuevaRespues: '',
    });

    cerrarModal();
    await mostrarToast('Tu duda se publicó', 'success');
  } catch (error) {
    console.error('Error al crear duda:', error);
    await mostrarToast('No se pudo crear la duda', 'danger');
  }
};

const responder = async (dud: DudaUi) => {
  if (!dud.nuevaRespues.trim()) return;
  if (bloquearSiOffline()) return;

  try {
    const res = await fetch(
      `https://backend-nexo.onrender.com/dudas/${dud.id}/respuestas`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          autor: usuario.value?.username || 'usuario',
          conte: dud.nuevaRespues.trim(),
        }),
      }
    );

    if (!res.ok) {
      throw new Error('Error al responder');
    }

    dud.respuestas.push({
      autor: usuario.value?.username || 'usuario',
      conte: dud.nuevaRespues.trim(),
      fecha: new Date().toISOString(),
    });

    dud.nuevaRespues = '';
    dud.mostrarRespuesta = false;
    marcarEscribiendo(false);
    await mostrarToast('Respuesta enviada', 'success');
  } catch (error) {
    console.error(error);
    await mostrarToast('No se pudo enviar la respuesta', 'danger');
  }
};

const eliminar = async (id: number) => {
  if (bloquearSiOffline()) return;
  try {
    const res = await fetch(`https://backend-nexo.onrender.com/dudas/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      throw new Error('Error al eliminar');
    }

    dudas.value = dudas.value.filter((d) => d.id !== id);
    await mostrarToast('Publicación eliminada', 'success');
  } catch (error) {
    console.error(error);
    await mostrarToast('No se puede eliminar la duda', 'danger');
  }
};

const toggleRevision = async (dud: DudaUi) => {
  if (bloquearSiOffline()) return;
  try {
    const res = await fetch(
      `https://backend-nexo.onrender.com/dudas/${dud.id}/revision`,
      { method: 'PUT' }
    );

    if (!res.ok) {
      throw new Error('Error al marcar para revision');
    }

    const dudaActualizada = await res.json();
    dud.revision = dudaActualizada.revision;
    await mostrarToast('Estado de revisión actualizado', 'success');
  } catch (error) {
    console.error(error);
    await mostrarToast('No se pudo marcar para revisión', 'danger');
  }
};

const toggleImportant = async (dud: DudaUi) => {
  if (bloquearSiOffline()) return;
  try {
    const res = await fetch(
      `https://backend-nexo.onrender.com/dudas/${dud.id}/importancia`,
      { method: 'PUT' }
    );

    if (!res.ok) {
      throw new Error('Error al cambiar su importancia');
    }

    const dudaActualizada = await res.json();
    dud.importancia = dudaActualizada.importancia;
    await mostrarToast('Importancia actualizada', 'success');
  } catch (error) {
    console.error(error);
    await mostrarToast('No se pudo cambiar la importancia', 'danger');
  }
};
</script>
