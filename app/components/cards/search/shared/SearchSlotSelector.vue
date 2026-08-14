<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDisplay } from 'vuetify'
import type { LogicalMatch } from '~~/app/utils/constants/search/conditions'
import type { SearchOption } from '~~/app/types/ui/searchOption'
import { LOGICAL_MATCH_OPTIONS, LOGICAL_MATCH } from '~~/app/utils/constants/search/conditions'

const props = withDefaults(
  defineProps<{
    label: string
    items: readonly SearchOption[]
    options?: readonly SearchOption[] 
    maxCount?: number 
  }>(),
  {
    options: () => LOGICAL_MATCH_OPTIONS,
    maxCount: 4,
  }
)

const slots = defineModel<Record<string, number>>('slots',{ default: () => ({})})
const match = defineModel<LogicalMatch>('match', { required: true })

const { mobile } = useDisplay()
const isOpen = ref(false)
const search = ref('')

// 検索窓に入力された文字列でアイテムをフィルタリング
const filteredItems = computed(() => {
  if (!search.value) return props.items
  return props.items.filter(item => item.label.includes(search.value))
})

// カウントの増減ロジック
const updateCount = (value: string, change: number) => {
  const current = slots.value[value] || 0
  const next = current + change
  const max = props.maxCount || 4

  if (next <= 0) {
    const { [value]: _removed, ...nextObj } = slots.value
    slots.value = nextObj
  } else if (next <= max) {
    slots.value = {
      ...slots.value,
      [value]: next
    }
  }
}

// すべての選択をリセットする処理
const resetAll = () => {
  slots.value = {}
}

// メイン画面のチップに表示するための、0より大きい選択中アイテム一覧
const activeItems = computed(() => {
  return props.items
    .filter(item => (slots.value[item.value] || 0) > 0)
    .map(item => ({
      ...item,
      count: slots.value[item.value]
    })) as (SearchOption & { count: number })[]
})

</script>

<template>
  <div>
    <div class="search-value-operator-container w-100">
      <div class="d-flex align-center gap-2 mb-2">
        <v-btn-toggle
          v-model="match"
          mandatory
          variant="outlined"
          density="compact"
          color="primary"
          class="operator-toggle"
          style="height: 32px"
          divided
        >
          <v-btn
            v-for="operator in options"
            :key="operator.value"
            :value="operator.value"
            class="px-3 text-body-2"
          >
            {{ operator.label }}
          </v-btn>
        </v-btn-toggle>
      </div>

      <div v-if="match !== LOGICAL_MATCH.NONE.value" class="d-flex align-center gap-2 mb-2">
        <v-btn
          variant="outlined"
          class="border-thin px-3"
          :class="{ 'bg-green-lighten-5': activeItems.length > 0 }"
          :color="activeItems.length > 0 ? 'primary' : ''"
          :style="{
            'background-color': activeItems.length > 0 ? '#8bc34a30' : '',
            'height': '34px'
          }"
          @click="isOpen = true"
        >
          <div class="d-flex align-center ga-1">
            <span
              class="text-body-2"
              :class="{
                'text-medium-emphasis':activeItems.length === 0,
                'font-weight-medium': activeItems.length > 0
              }"
            >
              {{ label }}
            </span>

            <v-icon 
              icon="mdi-chevron-down" 
              size="x-small" 
              class="text-medium-emphasis"
              :class="{ 'text-primary': activeItems.length > 0 }"
            />
          </div>
        </v-btn>
      </div>
    </div>

    <div v-if="activeItems.length && match !== LOGICAL_MATCH.NONE.value" class="d-flex flex-wrap ga-2 mt-2">
      <v-chip
        v-for="item in activeItems"
        :key="item.value"
        closable
        size="small"
        class="active-chip px-3 font-weight-medium"
        :class="!item.color?.startsWith('#') ? `bg-${item.color}` : ''"
        close-icon="mdi-close-circle"
        :style="{
          'background-color': item.color?.startsWith('#') ? item.color : '',
          'color': '#424242',
          'border': '1px solid rgba(0, 0, 0, 0.4)'
        }"
        @click:close="updateCount(item.value, -item.count)" 
      >
        {{ item.label }} ×{{ item.count }}
      </v-chip>
    </div>

    <v-bottom-sheet v-if="mobile" v-model="isOpen">
      <v-card rounded="t-xl">
        <v-card-title class="d-flex align-center justify-space-between w-100">
          <span>{{ label }}</span>
          <v-btn
            v-if="activeItems.length"
            prepend-icon="mdi-eraser"
            variant="text"
            density="comfortable"
            color="grey-darken-1"
            class="text-caption font-weight-bold"
            @click="resetAll"
          >
            クリア
          </v-btn>
        </v-card-title>

        <v-card-text>
          <v-text-field
            v-model="search"
            density="compact"
            variant="outlined"
            prepend-inner-icon="mdi-magnify"
            hide-details
            label="検索"
            class="mb-4"
          />

          <div class="selector-list">
            <div
              v-for="item in filteredItems"
              :key="item.value"
              class="d-flex align-center justify-space-between py-2 border-b"
            >
              <span :class="{ 'text-primary font-weight-bold': (slots[item.value] || 0) > 0 }">
                {{ item.label }}
              </span>
              
              <div class="d-flex align-center ga-3">
                <v-btn
                  icon="mdi-minus"
                  density="comfortable"
                  variant="tonal"
                  size="small"
                  :disabled="!(slots[item.value] || 0)"
                  @click="updateCount(item.value, -1)"
                />
                <span class="text-body-1 font-weight-bold text-center slot-count-display">
                  {{ slots[item.value] || 0 }}
                </span>
                <v-btn
                  icon="mdi-plus"
                  density="comfortable"
                  variant="tonal"
                  color="primary"
                  size="small"
                  :disabled="(slots[item.value] || 0) >= (maxCount || 4)"
                  @click="updateCount(item.value, 1)"
                />
              </div>
            </div>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="isOpen = false">
            完了
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-bottom-sheet>

    <v-dialog v-else v-model="isOpen" max-width="480">
      <v-card>
        <v-card-title class="d-flex align-center justify-space-between w-100">
          <span>{{ label }}</span>
          <v-btn
            v-if="activeItems.length"
            prepend-icon="mdi-eraser"
            variant="text"
            density="comfortable"
            color="grey-darken-1"
            class="text-caption font-weight-bold"
            @click="resetAll"
          >
            クリア
          </v-btn>
        </v-card-title>

        <v-card-text>
          <v-text-field
            v-model="search"
            density="compact"
            variant="outlined"
            prepend-inner-icon="mdi-magnify"
            hide-details
            label="検索"
            class="mb-4"
          />

          <div class="selector-list">
            <div
              v-for="item in filteredItems"
              :key="item.value"
              class="d-flex align-center justify-space-between py-2 border-b"
            >
              <span :class="{ 'text-primary font-weight-bold': (slots[item.value] || 0) > 0 }">
                {{ item.label }}
              </span>
              
              <div class="d-flex align-center ga-3">
                <v-btn
                  icon="mdi-minus"
                  density="comfortable"
                  variant="tonal"
                  size="small"
                  :disabled="!(slots[item.value] || 0)"
                  @click="updateCount(item.value, -1)"
                />
                <span class="text-body-1 font-weight-bold text-center slot-count-display">
                  {{ slots[item.value] || 0 }}
                </span>
                <v-btn
                  icon="mdi-plus"
                  density="comfortable"
                  variant="tonal"
                  color="primary"
                  size="small"
                  :disabled="(slots[item.value] || 0) >= (maxCount || 4)"
                  @click="updateCount(item.value, 1)"
                />
              </div>
            </div>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="isOpen = false">
            完了
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.selector-list {
  max-height: 50vh;
  overflow-y: auto;
}
.border-b {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}
.slot-count-display {
  width: 24px;
}
</style>