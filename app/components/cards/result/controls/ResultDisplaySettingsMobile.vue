<script setup lang="ts">
import type { ResultSortOptionItem, ResultSortOrderItem, ResultLimitOptionItem } from '~~/app/types/ui/result'

defineProps<{
  sortOptions: ResultSortOptionItem[]
  sortOrders: ResultSortOrderItem[]
  limitOptions: ResultLimitOptionItem[]
}>()

const currentSortItem = defineModel<string>('sortItem', { required: true })
const currentSortOrder = defineModel<string>('sortOrder', { required: true })
const currentlimitPerPage = defineModel<number>('limitPerPage', { required: true })

const isOpen = ref(false)

/**
 * BottomSheet編集中の一時状態
 */
const localSortItem = ref(currentSortItem.value)
const localSortOrder = ref(currentSortOrder.value)
const localLimit = ref(currentlimitPerPage.value)

/**
 * BottomSheetを開くたびに現在値をコピー
 */
watch(isOpen, (opened) => {
  if (!opened) return

  localSortItem.value = currentSortItem.value
  localSortOrder.value = currentSortOrder.value
  localLimit.value = currentlimitPerPage.value
})

const handleApply = () => {
  currentSortItem.value = localSortItem.value
  currentSortOrder.value = localSortOrder.value
  currentlimitPerPage.value = localLimit.value

  isOpen.value = false
}

const handleCancel = () => {
  isOpen.value = false
}
</script>

<template>
  <v-btn
    variant="outlined"
    density="comfortable"
    color="grey-darken-2"
    class="font-weight-bold flex-grow-1 button-border bg-white"
    prepend-icon="mdi-tune"
    style="height:34px"
    @click="isOpen = true"
  >
    表示条件
  </v-btn>

  <v-bottom-sheet v-model="isOpen">
    <v-card
      rounded="t-xl"
    >
      <v-card-title
        class="d-flex align-center justify-space-between w-100"
      >
        表示条件
      </v-card-title>

      <div class="pa-4">
        <div class="mb-4">
          <label class="text-caption font-weight-bold text-grey-darken-2 d-block mb-1">
            並び順
          </label>

          <div class="d-flex ga-2">
            <v-select
              v-model="localSortItem"
              :items="sortOptions"
              class="flex-grow-1"
              density="compact"
              variant="outlined"
              hide-details
            />

            <v-select
              v-model="localSortOrder"
              :items="sortOrders"
              item-title="title"
              item-value="value"
              density="compact"
              variant="outlined"
              hide-details
              style="max-width: 120px; flex-shrink: 0;"
            >
              <!-- 選択済み表示 -->
              <template #selection="{ item }">
                <div class="d-flex align-center">
                  <v-icon
                    size="16"
                    class="mr-1"
                  >
                    {{ item.icon }}
                  </v-icon>

                  {{ item.title }}
                </div>
              </template>

              <!-- メニュー -->
              <template #item="{ props, item }">
                <v-list-item
                  v-bind="props"
                  :title="item.title"
                >
                  <template #prepend>
                    <v-icon size="16">
                      {{ item.icon }}
                    </v-icon>
                  </template>
                </v-list-item>
              </template>
            </v-select>
          </div>
        </div>

        <div class="mb-6">
          <label class="text-caption font-weight-bold text-grey-darken-2 d-block mb-1">
            表示件数
          </label>

          <v-select
            v-model="localLimit"
            :items="limitOptions"
            density="compact"
            variant="outlined"
            hide-details
          >
            <template #item="{ props, item }">
              <v-list-item
                v-bind="props"
                :title="`${item.value}件表示`"
              />
            </template>
          </v-select>
        </div>

        <div class="d-flex align-center justify-space-between w-100 ga-2">
          <v-btn
            class="flex-grow-1"
            style="min-width: 0; flex: 1;"
            variant="outlined"
            color="grey"
            @click="handleCancel"
          >
            キャンセル
          </v-btn>

          <v-btn
            class="flex-grow-1"
            style="min-width: 0; flex: 1;"
            color="primary"
            @click="handleApply"
          >
            適用
          </v-btn>
        </div>

      </div>
    </v-card>
  </v-bottom-sheet>
</template>

<style scoped>
.button-border {
  border: 1px solid #26a326;
}
</style>