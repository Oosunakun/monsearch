<script setup lang="ts">
import { ref } from 'vue'

const sortItem = defineModel<string>('sortItem', { required: true })
const sortOrder = defineModel<string>('sortOrder', { required: true })
const limitPerPage = defineModel<number>('limitPerPage', { required: true })

const props = defineProps<{
  sortOptions: { title: string; value: string }[]
  sortOrders: { title: string; value: string; icon: string }[]
  limitOptions: { title: string; value: number }[]
}>()

/**
 * Popover state
 */
const sortPopover = ref(false)
const limitPopover = ref(false)

/**
 * 表示用ラベル
 */
const currentSortLabel = computed(() => {
  return props.sortOptions.find(o => o.value === sortItem.value)?.title ?? ''
})

const currentOrder = computed(() => {
  return props.sortOrders.find(o => o.value === sortOrder.value)
})

const currentLimitLabel = computed(() => {
  return `${limitPerPage.value}件`
})

/**
 * 選択時のハンドラー
 */
const handleSortItem = (value: string) => {
  sortItem.value = value
  sortPopover.value = false
}

const handleSortOrder = (value: string) => {
  sortOrder.value = value
  sortPopover.value = false
}

const handleLimit = (value: number) => {
  limitPerPage.value = value
  limitPopover.value = false
}
</script>

<template>
  <div class="d-flex align-center ga-2">

    <!-- =========================
         表示件数
    ========================== -->
    <v-menu
      v-model="limitPopover"
      location="bottom end"
      :close-on-content-click="false"
    >
      <template #activator="{ props }">
        <v-btn
          v-bind="props"
          variant="text"
          density="compact"
          color="grey-darken-2"
          class="text-caption font-weight-medium"
          style="height: 36px;"
        >
          {{ currentLimitLabel }}

          <v-icon size="18" class="ml-1">
            mdi-menu-down
          </v-icon>
        </v-btn>
      </template>

      <v-card min-width="140" class="pa-1">
        <v-list density="compact">
          <v-list-item
            v-for="item in limitOptions"
            :key="item.value"
            :class="{ 'selected-item': limitPerPage === item.value }"
            rounded="lg"
            @click="handleLimit(item.value)"
          >
            <div class="d-flex align-center">
                <v-icon
                size="16"
                width="16"
                class="mr-2"
                :color="limitPerPage === item.value ? 'primary' : 'transparent'"
              >
                mdi-check
              </v-icon>

              <v-list-item-title>
                {{ item.title }}
              </v-list-item-title>
            </div>
          </v-list-item>
        </v-list>
      </v-card>
    </v-menu>

    <!-- =========================
         並び順
    ========================== -->
    <v-menu
      v-model="sortPopover"
      location="bottom end"
      :close-on-content-click="false"
    >
      <template #activator="{ props }">
        <v-btn
          v-bind="props"
          variant="text"
          density="compact"
          color="grey-darken-2"
          class="text-caption font-weight-medium"
          style="height: 36px;"
        >
          <v-icon
            size="16"
            class="mr-1"
          >
            {{ currentOrder?.icon }}
          </v-icon>

          {{ currentSortLabel }}

          <v-icon size="18" class="ml-1">
            mdi-menu-down
          </v-icon>
        </v-btn>
      </template>

      <v-card width="260">
        <v-list density="compact">
          <v-list-subheader>
            並び順
          </v-list-subheader>
          <v-list-item
            v-for="item in sortOptions"
            :key="item.value"
            :class="{ 'selected-item': sortItem === item.value }"
            rounded="lg"
            @click="handleSortItem(item.value)"
          >
            <div class="d-flex align-center">
              <v-icon
                size="16"
                width="16"
                class="mr-2"
                :color="sortItem === item.value ? 'primary' : 'transparent'"
              >
                mdi-check
              </v-icon>

              <v-list-item-title>
                {{ item.title }}
              </v-list-item-title>
            </div>
          </v-list-item>

          <v-divider class="my-2" />

          <v-list-subheader>
            方向
          </v-list-subheader>

          <v-list-item
            v-for="order in sortOrders"
            :key="order.value"
            :class="{ 'selected-item': sortOrder === order.value }"
            rounded="lg"
            @click="handleSortOrder(order.value)"
          >
            <div class="d-flex align-center">
              <v-icon
                size="16"
                width="16"
                class="mr-2"
                :color="sortOrder === order.value ? 'primary' : 'transparent'"
              >
                mdi-check
              </v-icon>

              <v-list-item-title>
                <v-icon
                  size="16"
                  class="mr-1"
                >
                  {{ order.icon }}
                </v-icon>
                {{ order.title }}
              </v-list-item-title>
            </div>
          </v-list-item>
        </v-list>
      </v-card>
    </v-menu>
  </div>
</template>

<style scoped>
.v-card {
  border-radius: 10px;
}
.selected-item {
  background: #f3f9eb;
}

.selected-item:hover {
  background: #e8f4d9;
}
</style>