<template>
  <ion-footer class="app-contact-footer">
    <ion-toolbar>
      <div class="app-contact-footer__content">
        <p>
          {{ TEXTO_FOOTER_SOPORTE }}
          <a :href="`mailto:${CORREO_SOPORTE}`">{{ CORREO_SOPORTE }}</a>.
        </p>
      </div>
    </ion-toolbar>
  </ion-footer>
</template>

<script setup lang="ts">
import { IonFooter, IonToolbar } from '@ionic/vue';
import { CORREO_SOPORTE, TEXTO_FOOTER_SOPORTE } from '@/constants/contacto';
</script>
