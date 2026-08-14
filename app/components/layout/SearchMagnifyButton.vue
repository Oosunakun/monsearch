<script setup lang="ts">

</script>
<template>
  <v-btn
    icon="mdi-magnify"
    variant="text"
    to="/cards/search"
    title="詳細検索へ"
    :active="false"
    :ripple="false"
    class="flex-shrink-0 search-btn"
  />
</template>
<style scoped>
.search-btn :deep(.v-btn__overlay) {
  display: none;
}
</style>