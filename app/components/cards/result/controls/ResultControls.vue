<script setup lang="ts">
import { useDisplay } from 'vuetify'
import type { ConditionItem } from '~~/app/types/ui/result'
import ResultConditionViewer from '~~/app/components/cards/result/controls/ResultConditionViewer.vue'

const { mobile } = useDisplay()

defineProps<{
  conditions: ConditionItem[]
}>()

const isDisplayConditionsOpen = ref(false)

const handleEditConditions = () => {
  navigateTo('/cards/search/')
}

const handleApplyViewer = () => {
  isDisplayConditionsOpen.value = true
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

    <v-btn
      variant="outlined"
      density="comfortable"
      color="grey-darken-2"
      class="font-weight-bold flex-grow-1 button-border"
      style="height: 34px;"
      :style="{
        minWidth: mobile ? '0' : '145px',
        flex: mobile ? '1' : 'none',
        marginLeft: mobile ? '0' : '8px' 
      }"
      prepend-icon="mdi-file-document-outline"
      @click="handleApplyViewer"
    >
      検索条件表示
    </v-btn>
  </div>

  <ResultConditionViewer
    v-model="isDisplayConditionsOpen"
    :conditions="conditions"
  />
</template>
<style scoped>
.button-border {
  border: 1px solid #26a326;
}
</style>