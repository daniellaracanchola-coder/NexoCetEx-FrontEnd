<template> 
  <ion-page> 
    <ion-header :translucent="true"> 
      <ion-toolbar style="--background: beige; --color: #000000;"> 
        <ion-buttons slot="start"> 
          <ion-menu-button></ion-menu-button> 
        </ion-buttons> 
        <div style="display: flex; align-items: center;">
          <ion-title> 
            <img src="@/assets/AppLogo.png" style="height:40px; margin-right:8px;"> 
            Muro Inicial
          </ion-title> 
          <p style="margin: 0;"> NEXO CETI EXPRESS </p>
        </div>
      </ion-toolbar> 
    </ion-header> 

    <ion-content :fullscreen="true"> 
      <ion-header collapse="condense"> 
        <ion-toolbar> 
          <ion-title size="large">Blank</ion-title> 
        </ion-toolbar> 
      </ion-header> 
      
      <div id="container">  
        <p> En esta seccion se veran los anuncios, <strong>Es necesario que se marquen como vistos </strong> </p>
        <p> Esto para garantizar que llego la informacion. </p>
        <img src="@/assets/Avisos.png" style="height:60px; margin-right:20px; display:block; margin: 0 auto;">
      </div> 
      <div>
        <ion-button expand="block" v-if="usuario?.rol === 'admin' || usuario?.rol === 'profesor'" @click="abrirMFun">
          Crear anuncios
        </ion-button>
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

            <ion-button expand="block" @click="guardarA">
              Publicar
            </ion-button>

            <ion-button expand="block" color="medium" @click="abrirM = false">
              Cancelar
            </ion-button>
            <p v-if="errorA" style="color:red;">
              {{ errorA }}
            </p>
          </ion-content>
        </ion-modal>

        <ion-card 
          v-for="anuncio in filtro" 
          :key="anuncio.id"
          :style="{
          opacity: anuncio.vistosPor?.includes(usuario?.username) ? 0.5 : 1,

          backgroundColor: anuncio.tipo === 'importante'
            ? '#ffebee'
            : (!anuncio.vistosPor?.includes(usuario?.username) ? '#fff3e0' : '#fff'),

          border: anuncio.tipo === 'importante'
            ? '2px solid red'
            : '1px solid #ddd'
          }">

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

            <p v-if="anuncio.fecha" style="font-size: 12px; color: gray;">
              {{new Date(anuncio.fecha).toLocaleString() }}
            </p>

          </ion-card-content>

          
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
  IonButtons, 
  IonModal,
  IonInput,
  IonTextarea,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonBadge,
  IonMenuButton, 
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption
} from '@ionic/vue'; 

import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { onIonViewWillEnter } from '@ionic/vue';

onIonViewWillEnter(() => {
  cargarAnun();
});

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
            'http://192.168.1.80:3000/avisos',
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
    } catch (error) {
        console.error(error);
        errorA.value = 'Error al conectarse con el servidor';
    }
};

const eliminarAnun = async (id: number) => {
  try {
    await fetch(
        `http://192.168.1.80:3000/avisos/${id}`,
        {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    await cargarAnun();
  } catch (error) {
    console.error(error);
  }
};

onMounted(() => {
  
  const data = localStorage.getItem('usuario');

  if (!data) {
    router.push('/login');
    return;
  }
    if(!token) {
        router.push('/login');
        return;
    }
    
  usuario.value = JSON.parse(data);
  cargarAnun();
});

const anunLeido = async (anuncio: any) => {
    try {
        await fetch(
            `http://192.168.1.80:3000/avisos/${anuncio.id}/leido`,
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

        await cargarAnun();

    } catch (error) {
        console.error(error);
    }
}; 

const abrirMFun = () => {
  errorA.value = '';
  abrirM.value = true;
}

const cambiarTipo = async (anuncio: any) => {
  try {
    await fetch(
        `http://192.168.1.80:3000/avisos/${anuncio.id}/tipo`,
        {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    await cargarAnun();

  } catch (error) {
    console.error(error);
  }
};

const ordenarAnun = () => {
  anuncios.value.sort((a, b) => {
    if (a.tipo === 'importante' && b.tipo !== 'importante') return -1;
    if (a.tipo !== 'importante' && b.tipo === 'importante') return 1;
    return (new Date(b.fecha || 0).getTime() - new Date(a.fecha || 0).getTime());
  });
}

const cargarAnun = async () => {
  try {
    const res = await fetch(
        'http://192.168.1.80:3000/avisos',
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
  
  <style scoped> 
  #container {  
    text-align: center;
    margin-top: 20px;
  } 
    
  #container strong { 
    font-size: 20px; 
    line-height: 26px; 
  } 
      
  #container p { 
    font-size: 16px; 
    line-height: 22px; 
    color: #000000; 
    margin: 0; 
  }     
        
  #container a { 
    text-decoration: none; 
    background: #44aa11
  } 
  </style>
