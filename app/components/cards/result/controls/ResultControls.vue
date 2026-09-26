<script setup lang="ts">
import { useDisplay } from 'vuetify'
import type { LocationQuery } from 'vue-router'
import type { ConditionItem } from '~~/app/types/ui/result'

const { mobile } = useDisplay()

const props = defineProps<{
  conditions: ConditionItem[]
  query: LocationQuery
}>()

const handleEditConditions = () => {
  navigateTo({ path: '/cards/search', query: props.query })
}
</script>

<template>
  <div 
    class="d-flex align-center mb-3"
      :class="mobile ? 'justify-space-between w-100 ga-2' : 'justify-start w-auto mr-2'"
    >
    <v-btn
      variant="flat"
      density="comfortable"
      color="primary"
      class="font-weight-bold flex-grow-1 button-border"
      style="height: 34px;"
      :style="{
        minWidth: mobile ? '0' : '145px',
        flex: mobile ? '1' : 'none'
      }"
      prepend-icon="mdi-pencil"
      @click="handleEditConditions"
    >
      条件を編集
    </v-btn>
  </div>
</template>
<style scoped>
.button-border {
  border: 1px solid #26a326;
}
</style>
