<script setup lang="ts">
import type { NavItem, QuickSearchOption, QuickSearchState } from '~~/app/types/ui/layout'
import ContentMaxWidthContainer from '~~/app/components/atoms/common/ContentMaxWidthContainer.vue'
import MobileNavList from '~~/app/components/molecules/navigation/MobileNavList.vue'
import NavButtonGroup from '~~/app/components/molecules/navigation/NavButtonGroup.vue'
import QuickSearchBar from '~~/app/components/molecules/search/QuickSearchBar.vue'
import { UI_COLORS } from '~~/app/utils/constants/colors'

const props = defineProps<{
  drawer: boolean
  navItems: NavItem[]
  quickSearchState: QuickSearchState
  cardPools: QuickSearchOption[]
  searchTypes: QuickSearchOption[]
}>()

const emit = defineEmits<{
  'update:drawer': [value: boolean]
  'update:quickSearchState': [value: QuickSearchState]
  navigate: [path: string]
  submitQuickSearch: []
}>()

const route = useRoute()
const activePath = computed(() => route.path)
</script>

<template>
  <MobileNavList
    :model-value="drawer"
    :items="navItems"
    :active-path="activePath"
    @update:model-value="emit('update:drawer', $event)"
    @navigate="emit('navigate', $event)"
  />

  <v-app-bar color="surface" border="b" elevation="0" class="header-app-bar">
    <ContentMaxWidthContainer class="py-3">
      <div class="d-flex flex-column flex-lg-row align-lg-center justify-lg-space-between ga-3">
        <div class="d-flex align-center justify-space-between ga-2">
          <div>
            <p class="text-h4 font-weight-bold mb-1 header-site-title" :style="{ color: UI_COLORS.HEADING_BROWN }">
              モンさーち！
            </p>
            <p class="text-caption">
              モンコレTCG検索支援サイト
            </p>
          </div>
          <v-app-bar-nav-icon class="d-lg-none" @click="emit('update:drawer', !drawer)" />
        </div>

        <QuickSearchBar
          :model-value="quickSearchState"
          :card-pools="cardPools"
          :search-types="searchTypes"
          @update:model-value="emit('update:quickSearchState', $event)"
          @submit="emit('submitQuickSearch')"
        />
      </div>

      <NavButtonGroup :items="navItems" :active-path="activePath" />
    </ContentMaxWidthContainer>
  </v-app-bar>
</template>

<style scoped>
.header-site-title {
  line-height: 1.1;
}

.header-app-bar :deep(.v-toolbar__content) {
  height: auto !important;
  align-items: stretch;
}
</style>
