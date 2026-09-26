<script setup lang="ts">
import type { QuickSearchOption, QuickSearchState, QuickSearchTarget, NavItem } from '~~/app/types/ui/layout'
import SearchMagnifyButton from '~~/app/components/layout/SearchMagnifyButton.vue'
import QuickSearchBar from '~~/app/components/layout/QuickSearchBar.vue'
import NavigationList from '~~/app/components/layout/NavigationList.vue'
import NavigationFooter from '~~/app/components/layout/NavigationFooter.vue'
import { useHydrated } from '~~/app/composables/useHydrated'

const { drawer, rail, isMobile, navItems, quickSearchState, searchTypes } = defineProps<{
  drawer: boolean
  rail: boolean
  isMobile: boolean
  navItems: NavItem[]
  quickSearchState: QuickSearchState
  searchTypes: QuickSearchOption<QuickSearchTarget>[]
}>()

const emit = defineEmits<{
  'update:drawer': [value: boolean]
  'update:rail':   [value: boolean]
  'update:quickSearchState': [value: QuickSearchState]
  'submit': []
}>()

const { isMounted } = useHydrated()
</script>

<template>
  <template v-if="!isMounted">
    <!-- SkeletonLoader を表示するのではなく、ドロワーそのものを表示させないことでハイドレーション時の表示処理を表現する -->
  </template>
  <template v-else>
    <v-navigation-drawer
      :model-value="drawer"
      :rail="!isMobile && rail"
      :permanent="!isMobile"
      elevation="1"
      :class="{ 
        'is-rail': !isMobile && rail, 
        'is-expanded': !isMobile && !rail,
        'mobile-drawer': isMobile 
      }"
      @update:model-value="emit('update:drawer', $event)"
    >
      <template v-if="isMobile">
        <div class="pa-4 pb-2">
          <QuickSearchBar
            :model-value="quickSearchState"
            :search-types="searchTypes"
            :card-pools="[]"
            layout="vertical"
            @update:model-value="emit('update:quickSearchState', $event)"
            @submit="emit('submit')"
          />
        </div>

        <v-divider class="mt-4 mb-2" />
      </template>

      <template v-else>
        <v-list-item class="pa-2">
          <div class="d-flex align-center justify-space-between w-100">
            <v-btn
              icon="mdi-menu"
              variant="text"
              @click.stop="$emit('update:rail', !rail)"
            />
            
            <SearchMagnifyButton />
          </div>
        </v-list-item>
      </template>

      <NavigationList 
        :items="navItems"
      />

      <template #append>
        <NavigationFooter 
          :rail = "rail"
        />
      </template>
    </v-navigation-drawer>
  </template>
</template>
