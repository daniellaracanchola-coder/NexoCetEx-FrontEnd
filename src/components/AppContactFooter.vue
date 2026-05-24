<template>
  <footer class="app-contact-footer">
    <p>
      {{ TEXTO_FOOTER_SOPORTE }}
      <a :href="`mailto:${CORREO_SOPORTE}`">{{ CORREO_SOPORTE }}</a>.
    </p>
  </footer>
</template>

<script setup lang="ts">
import { CORREO_SOPORTE, TEXTO_FOOTER_SOPORTE } from '@/constants/contacto';
</script>
