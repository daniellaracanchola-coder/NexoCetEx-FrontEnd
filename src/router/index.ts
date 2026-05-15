import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';

import HomePage from '../views/home/HomePage.vue';
import LoginPage from '../views/LoginPage.vue';
import GruposPage from '../views/grupos/GruposPage.vue';
import ConfigPage from '../views/config/ConfigPage.vue';
import NexoAPage from '../views/nexoA/NexoAPage.vue';
import RegistroPage from '../views/RegistroPage.vue';
import AdministracionPage from '../views/admin/AdministracionPage.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login' 
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
  },
  {
    path: '/register',
    name: 'Registro',
    component: RegistroPage
  },
  {
    path: '/admin',
    name: 'Administracion',
    component: AdministracionPage,
    meta: {
        requiresAdmin: true
    }
  }

];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

router.beforeEach((to, from, next) => {
    const usuarioGuardado = localStorage.getItem('usuario');
    const usuario = usuarioGuardado
        ? JSON.parse(usuarioGuardado)
        : null;
    
    if (to.meta.requiresAdmin) {
        if (!usuario || usuario.rol !== 'admin') {
            return next('/home');
        }
    }

    next();

});

export default router;