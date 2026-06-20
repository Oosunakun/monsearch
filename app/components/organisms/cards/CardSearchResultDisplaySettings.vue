<script setup lang="ts">
import { useDisplay } from 'vuetify'

import CardSearchResultDisplaySettingsMobile from '~~/app/components/organisms/cards/CardSearchResultDisplaySettingsMobile.vue'
import CardSearchResultDisplaySettingsDesktop from '~~/app/components/organisms/cards/CardSearchResultDisplaySettingsDesktop.vue'

const { mobile } = useDisplay()

defineProps<{
    sortOptions:any[]
    sortOrders:any[]
    limitOptions:any[]
}>()

const sortItem = defineModel<string>('sortItem',{ required: true })
const sortOrder = defineModel<string>('sortOrder',{ required: true })
const limitPerPage = defineModel<number>('limitPerPage',{ required: true })
</script>
<template>
  <CardSearchResultDisplaySettingsMobile
      v-if="mobile"
      v-model:sort-item="sortItem"
      v-model:sort-order="sortOrder"
      v-model:limit-per-page="limitPerPage"
      :sort-options="sortOptions"
      :sort-orders="sortOrders"
      :limit-options="limitOptions"
  />
  <CardSearchResultDisplaySettingsDesktop
      v-else
      v-model:sort-item="sortItem"
      v-model:sort-order="sortOrder"
      v-model:limit-per-page="limitPerPage"
      :sort-options="sortOptions"
      :sort-orders="sortOrders"
      :limit-options="limitOptions"
  />
</template>

<!-- <script setup lang="ts">
import { useDisplay } from 'vuetify'

const { mdAndUp } = useDisplay()

const isOpen = defineModel<boolean>()

const currentSort = defineModel<string>('sort', { required: true })
const itemsPerPage = defineModel<number>('limit', { required: true })

defineProps<{
  sortOptions: { title: string; value: string }[]
  limitOptions: { title: string; value: number }[]
}>()

defineEmits<{
  apply: []
}>()
</script>

<template>
  <v-dialog
    v-if="mdAndUp"
    v-model="isOpen"
    max-width="600px"
  >
    <v-card rounded="xl" class="mx-auto w-100">
      <v-card-title class="text-center text-body-2 font-weight-bold pt-4 pb-2 border-b">
        表示設定の変更
      </v-card-title>

      <div class="pa-4">
        <div class="mb-4">
          <label class="text-caption font-weight-bold text-grey-darken-2 d-block mb-1">並び順</label>
          <v-select v-model="currentSort" :items="sortOptions" density="compact" variant="outlined" hide-details />
        </div>

        <div class="mb-6">
          <label class="text-caption font-weight-bold text-grey-darken-2 d-block mb-1">表示件数</label>
          <v-select v-model="itemsPerPage" :items="limitOptions" density="compact" variant="outlined" hide-details>
            <template #item="{ props, item }">
              <v-list-item v-bind="props" :title="item.value + '件ずつ表示'" />
            </template>
          </v-select>
        </div>

        <div class="d-flex ga-2">
          <v-btn variant="outlined" color="grey" class="flex-grow-1" size="small" @click="isOpen = false">キャンセル</v-btn>
          <v-btn color="primary" variant="flat" class="flex-grow-1" size="small" @click="$emit('apply')">設定を適用</v-btn>
        </div>
      </div>
    </v-card>
  </v-dialog>

  <v-bottom-sheet
    v-else
    v-model="isOpen"
  >
    <v-card rounded="t-xl" class="mx-auto" max-width="600px">
      <v-card-title class="text-center text-body-2 font-weight-bold pt-4 pb-2 border-b">
        表示設定の変更
      </v-card-title>

      <div class="pa-4">
        <div class="mb-4">
          <label class="text-caption font-weight-bold text-grey-darken-2 d-block mb-1">並び順</label>
          <v-select v-model="currentSort" :items="sortOptions" density="compact" variant="outlined" hide-details />
        </div>

        <div class="mb-6">
          <label class="text-caption font-weight-bold text-grey-darken-2 d-block mb-1">表示件数</label>
          <v-select v-model="itemsPerPage" :items="limitOptions" density="compact" variant="outlined" hide-details>
            <template #item="{ props, item }">
              <v-list-item v-bind="props" :title="item.value + '件ずつ表示'" />
            </template>
          </v-select>
        </div>

        <div class="d-flex ga-2">
          <v-btn variant="outlined" color="grey" class="flex-grow-1" size="small" @click="isOpen = false">キャンセル</v-btn>
          <v-btn color="primary" variant="flat" class="flex-grow-1" size="small" @click="$emit('apply')">設定を適用</v-btn>
        </div>
      </div>
    </v-card>
  </v-bottom-sheet>
</template>

<style scoped>
.border-b {
  border-bottom: 1px solid #e0e0e0;
}
</style> -->