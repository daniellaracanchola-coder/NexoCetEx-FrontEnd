import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';

import HomePage from '../views/home/HomePage.vue';
import LoginPage from '../views/LoginPage.vue';
import GruposPage from '../views/grupos/GruposPage.vue';
import ConfigPage from '../views/config/ConfigPage.vue';
import NexoAPage from '../views/nexoA/NexoAPage.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login' // 🔥 CAMBIO CLAVE
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/grupos',
    name: 'Grupos',
    component: GruposPage
  },
  {
    path: '/config',
    name: 'Configuracion',
    component: ConfigPage
  },
  {
    path: '/nexo-a',
    name: 'Nexo de Ayuda',
    component: NexoAPage
  }

];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;