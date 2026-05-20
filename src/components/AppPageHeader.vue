<template>
  <ion-toolbar :class="{ 'app-toolbar--login': layout === 'login' }">
    <ion-buttons v-if="showMenu" slot="start">
      <ion-menu-button />
    </ion-buttons>
    <ion-buttons v-else-if="backHref" slot="start">
      <ion-back-button :default-href="backHref" />
    </ion-buttons>

    <div class="app-toolbar-content" :class="`app-toolbar-content--${layout}`">
      <template v-if="layout === 'login'">
        <h1 class="app-toolbar-title">{{ title }}</h1>
        <div class="app-toolbar-top">
          <img
            v-if="showLogo"
            src="@/assets/AppLogo.png"
            class="app-logo"
            alt="NEXO"
          />
          <p v-if="showBrand" class="app-header-brand">NEXO CETI EXPRESS</p>
        </div>
      </template>
      <template v-else>
        <div class="app-toolbar-top">
          <img
            v-if="showLogo"
            src="@/assets/AppLogo.png"
            class="app-logo"
            alt="NEXO"
          />
          <h1 class="app-toolbar-title">{{ title }}</h1>
        </div>
        <p v-if="showBrand" class="app-header-brand">NEXO CETI EXPRESS</p>
      </template>
    </div>
  </ion-toolbar>
</template>

<script setup lang="ts">
import {
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonBackButton,
} from '@ionic/vue';

withDefaults(
  defineProps<{
    title: string;
    showMenu?: boolean;
    showLogo?: boolean;
    showBrand?: boolean;
    backHref?: string;
    layout?: 'default' | 'login';
  }>(),
  {
    showMenu: true,
    showLogo: true,
    showBrand: true,
    layout: 'default',
  }
);
</script>
