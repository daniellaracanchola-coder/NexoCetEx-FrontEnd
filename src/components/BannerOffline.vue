<template>
  <div v-if="activo" class="banner-offline" role="status">
    <p class="banner-offline__titulo">Sin conexión al servidor</p>
    <p class="banner-offline__texto">
      Mostrando la última información guardada
      <span v-if="fecha">({{ fecha }})</span>.
      No puedes enviar ni modificar datos hasta que el servicio vuelva.
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  activo: boolean;
  fecha?: string;
}>();
</script>
