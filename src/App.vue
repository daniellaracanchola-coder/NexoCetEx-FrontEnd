<template> <!--Primera parte del codigo, para el acomodo de los componentes web de la aplicacion -->
  <ion-app>

    <ion-menu content-id="main-content"> <!-- Para la creacion del menu lateral -->
      <ion-header> <!-- Semantica para que el componente que siempre en la parte superior de la pagina -->
        <ion-toolbar> <!-- Componente con el que se visualiza el menu lateral -->
          <ion-title>Menu</ion-title> <!-- Titulo del componente anterior, es decir, el menu -->
        </ion-toolbar>
      </ion-header>

      <ion-content class="Lateral"> <!-- Inicia el contenido del componente -->
        <ion-list> <!-- Inicia una lista que va anidada en el componente -->
          <ion-item router-link="/home">Muro</ion-item> <!-- Los objetos de la lista se componen de ruta de la vista de la pagina y nombre que aparece en el menu -->
          <ion-item router-link="/grupos">Grupos</ion-item>
          <ion-item router-link="/nexo-a">Nexo de Ayuda</ion-item>
          <ion-item router-link="/config">Configuracion y Accesibilidad</ion-item>
          <ion-item router-link="/admin" v-if="usuario?.rol === 'admin'">Administracion</ion-item>
          <ion-item @click="logout">Cerrar sesion</ion-item> <!-- @click es la manera de decir que cuando el usuario haga click sucedera algo, en este caso llamara a la funcion para cerrar sesion -->
        </ion-list>
      </ion-content>
    </ion-menu>

    <!-- Inicio de la pagina principal -->
    <ion-router-outlet id="main-content" /> 

  </ion-app>
</template>

<script setup lang="ts"> // Segunda seccion del codigo, aqui va la logica del programa 
import { 
  IonApp, 
  IonRouterOutlet, 
  IonMenu, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonList, 
  IonItem 
} from '@ionic/vue'; // Se importan las bibliotecas de los componentes de IONIC/Vue 

import { useRouter } from 'vue-router'; 

const router = useRouter(); // Declaracion de la variable Router, importada anteriormente 

// Declaracion de la variable usuario, que se guarda en un JSON de manera local en el disposivo y verifica que no sea nulo 
const usuario = JSON.parse(
    localStorage.getItem('usuario') || 'null'
);

// Declaracion de la funcion de cerrar sesion, se borra el contenido actual en la variable usuario y recarga la pagina a la vista de Login/ Inicio de sesion 
const logout = () => {
  localStorage.removeItem('usuario');
  localStorage.removeItem('token');
  router.push('/login');
};
</script>

<!-- Aqui puede ir una tercera parte del codigo, que define el estilo visual de la pagina y los componentes -->