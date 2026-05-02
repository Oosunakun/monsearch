<script setup lang="ts">
withDefaults(
  defineProps<{
    marginBottom?: boolean
    contentClass?: string
  }>(),
  {
    marginBottom: true,
    contentClass: ''
  }
)
</script>

<template>
  <v-card 
    variant="flat"
    color="white"
    :class="{ 'mb-4': marginBottom }"
    elevation="1"
  >
    <slot name="header"></slot>
    <v-card-text :class="[ contentClass ]">
      <slot></slot>
    </v-card-text>
  </v-card>
</template>
<style scoped>
:deep(.v-card-text) {
  line-height: 1.4;
  letter-spacing: -0.01em;
  padding: 0.95rem;
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
  font-size: 0.95rem;
}

/* ブラウザデフォルトmarginを明示的にリセット */
:deep(.v-card-text p),
:deep(.v-card-text ul),
:deep(.v-card-text ol) {
  margin-top: 0;
  margin-bottom: 0;
}

:deep(ul) {
  padding-left: 1.3rem; 
  list-style-type: disc;
}
:deep(li) {
  margin-bottom: 2px;
}
:deep(.v-card-text li:last-child) {
  margin-bottom: 0;
}
:deep(li::marker) {
  color: #666;
}
</style>