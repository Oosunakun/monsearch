<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDisplay } from 'vuetify'
import type { SearchOption } from '~~/app/types/ui/searchOption'

const props = defineProps<{
  label: string
  items: readonly SearchOption[]
}>()

const selectedValues = defineModel<string[]>({
  default: () => []
})

const { mobile } = useDisplay()

const isOpen = ref(false)
const search = ref('')

const filteredItems = computed(() => {
  if (!search.value) return props.items

  return props.items.filter(item =>
    item.label.includes(search.value)
  )
})

const toggleItem = (value: string) => {
  const exists =
    selectedValues.value.includes(value)

  if (exists) {
    selectedValues.value =
      selectedValues.value.filter(v => v !== value)
  } else {
    selectedValues.value = [
      ...selectedValues.value,
      value,
    ]
  }
}

// すべての選択をリセットする処理
const resetAll = () => {
  selectedValues.value = []
}

const selectedLabels = computed(() => {
  return props.items
    .filter(item =>
      selectedValues.value.includes(item.value)
    )
})
</script>

<template>
  <div>
    <!-- activator -->
    <div class="search-value-operator-container w-100">

      <div class="d-flex align-center gap-2 mb-2">
        <v-btn
          variant="outlined"
          class="border-thin px-3"
          :class="{ 'bg-green-lighten-5': selectedValues.length > 0 }"
          :color="selectedValues.length > 0 ? 'primary' : ''"
          :style="{
            'background-color': selectedValues.length > 0 ? '#8bc34a30' : '',
            'height': '34px'
          }"
          @click="isOpen = true"
        >
          <div class="d-flex align-center ga-1">
            <span
              class="text-body-2"
              :class="{
                'text-medium-emphasis':selectedValues.length === 0,
                'font-weight-medium': selectedValues.length > 0
              }"
            >
              {{ label }}
            </span>

            <v-icon 
              icon="mdi-chevron-down" 
              size="x-small" 
              class="text-medium-emphasis"
              :class="{ 'text-primary': selectedValues.length > 0 }"
            />
          </div>
        </v-btn>
      </div>
    </div>

    <!-- selected chips -->
    <div
      v-if="selectedLabels.length"
      class="d-flex flex-wrap ga-2 mt-2"
    >
      <v-chip
        v-for="item in selectedLabels"
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
        @click:close="toggleItem(item.value)"
      >
        {{ item.label }}
      </v-chip>
    </div>

    <!-- Mobile -->
    <v-bottom-sheet v-if="mobile" v-model="isOpen">
      <v-card rounded="t-xl">
        <v-card-title class="d-flex align-center justify-space-between w-100">
          {{ label }}
          <v-btn
            v-if="selectedValues.length"
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
            <v-checkbox
              v-for="item in filteredItems"
              :key="item.value"
              :model-value="
                selectedValues.includes(item.value)
              "
              hide-details
              density="compact"
              color="#8bc34aCC"
              @update:model-value="
                toggleItem(item.value)
              "
            >
              <template #label>
                {{ item.label }}
              </template>
            </v-checkbox>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn
            color="primary"
            @click="isOpen = false"
          >
            完了
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-bottom-sheet>

    <!-- PC -->
    <v-dialog
      v-else
      v-model="isOpen"
      max-width="480"
    >
      <v-card>
        <v-card-title class="d-flex align-center justify-space-between w-100">
          {{ label }}
          <v-btn
            v-if="selectedValues.length"
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
            <v-checkbox
              v-for="item in filteredItems"
              :key="item.value"
              :model-value="
                selectedValues.includes(item.value)
              "
              hide-details
              density="compact"
              color="#8bc34aCC"
              @update:model-value="
                toggleItem(item.value)
              "
            >
              <template #label>
                {{ item.label }}
              </template>
            </v-checkbox>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn
            color="primary"
            @click="isOpen = false"
          >
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
</style>