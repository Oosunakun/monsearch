<script setup lang="ts">
import ContentMaxWidthContainer from '~~/app/components/atoms/common/ContentMaxWidthContainer.vue'
</script>

<template>
  <v-footer class="bg-on-surface text-white py-4">
    <ContentMaxWidthContainer class="d-flex flex-column flex-sm-row justify-space-between ga-2 text-caption">
      <p>
        当サイトの情報は非公式データです。利用は自己責任でお願いします。
      </p>
      <p>
        &copy; {{ new Date().getFullYear() }} Monsearch Archive
      </p>
    </ContentMaxWidthContainer>
  </v-footer>
</template>
