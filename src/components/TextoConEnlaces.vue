<template>
  <component
    :is="tag"
    class="texto-con-enlaces"
    v-html="html"
    @click="onClick"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { linkifyText } from '@/utils/enlaces';

const props = withDefaults(
  defineProps<{
    texto?: string;
    tag?: string;
  }>(),
  {
    texto: '',
    tag: 'span',
  }
);

const html = computed(() => linkifyText(props.texto));

function onClick(event: MouseEvent) {
  const anchor = (event.target as HTMLElement | null)?.closest('a');
  if (!anchor?.href) return;

  event.preventDefault();
  event.stopPropagation();
  window.open(anchor.href, '_blank', 'noopener,noreferrer');
}
</script>
