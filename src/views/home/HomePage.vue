<template> 
  <ion-page> 
    <ion-header :translucent="true"> 
      <AppPageHeader title="Muro" /> 
    </ion-header> 

    <ion-content :fullscreen="true" class="avisos"> 
      <ion-header collapse="condense"> 
        <ion-toolbar> 
          <ion-title size="large">Blank</ion-title> 
        </ion-toolbar> 
      </ion-header> 
      
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
        <div class="btn-solo" v-if="usuario?.rol === 'admin' || usuario?.rol === 'profesor'">
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
              placeholder="Titulo"
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
              v-model="rolDes" placeholder="Elige a quien:">
                <ion-select-option value="todos">Todos</ion-select-option>
                <ion-select-option value="alumno">Alumnos</ion-select-option>
                <ion-select-option value="profesor">Profesores</ion-select-option>
              </ion-select>
            </ion-item>

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
            {{ anuncio.conte}}
            <ion-badge color="medium"
            v-if="anuncio.rolDes !== 'todos'">
              {{ anuncio.rolDes }}
            </ion-badge>

            <ion-badge
              color="warning"
              v-if="!anuncio.vistosPor?.includes(usuario?.username)">
              Nuevo
            </ion-badge>
            
            <ion-badge 
              color="success"
              v-if="anuncio.vistosPor?.includes(usuario?.username)">
              Leido 
            </ion-badge>
            
            <div v-if="usuario?.rol === 'admin'">
              <ion-badge
                v-for="user in anuncio.vistosPor || []"
                :key="user"
                color="primary"
                style="margin-right:5px;">
                {{ user }}
              </ion-badge>
            </div>

            <p v-if="anuncio.fecha" class="muted-text">
              {{ new Date(anuncio.fecha).toLocaleString() }}
            </p>

          </ion-card-content>

          <div class="btn-group btn-group--card">
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
              Marcar como leido
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
  </ion-page> 
</template> 

<script setup lang="ts">
import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar, 
  IonModal,
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

let intervalAvisos: any;

const router = useRouter();

const usuario = ref<any>(null);

const abrirM = ref(false);
const nuevoTit = ref('');
const nuevoConte = ref('');

const rolDes = ref('todos');

const anuncios = ref<any[]>([]);

const errorA = ref('');

const token = localStorage.getItem('token');



const guardarA = async () => {
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
                    rolDes: rolDes.value
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
        errorA.value = '';
        abrirM.value = false;
        await mostrarToast('Anuncio publicado', 'success');
    } catch (error) {
        console.error(error);
        errorA.value = 'Error al conectarse con el servidor';
    }
};

const eliminarAnun = async (id: number) => {
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
    clearInterval(intervalAvisos);
})

const anunLeido = async (anuncio: any) => {
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

const abrirMFun = () => {
  errorA.value = '';
  abrirM.value = true;
};

const cambiarTipo = async (anuncio: any) => {
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
    const res = await fetch(
        'https://backend-nexo.onrender.com/avisos',
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    if (!res.ok) {
        console.error('Error al cargar avisos');
        return;
    }
    anuncios.value = await res.json();

    ordenarAnun();
  } catch (error) {
    console.error(error);
  }
};

const filtro = computed(() => {
  return anuncios.value.filter(a => {
    if (usuario.value?.rol === 'admin') return true;
    if (a.rolDes === 'todos') return true;
    if (usuario.value?.username === a.autor) return true;
    return a.rolDes === usuario.value?.rol;
  });
});

</script>
  
