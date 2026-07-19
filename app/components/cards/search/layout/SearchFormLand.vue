<script setup lang="ts">
import SearchFieldDivider from '~~/app/components/cards/search/shared/SearchFieldDivider.vue'
import SearchFieldLimit from '~~/app/components/cards/search/land/SearchFieldLimit.vue'
import SearchFieldLandCategory from '~~/app/components/cards/search/land/SearchFieldLandCategory.vue'

import type { SearchForm } from '~~/app/types/ui/search'

// 親から渡されたモデルを各フィールドに分配する
const model = defineModel<SearchForm>({ required: true })
</script>

<template>
  <SearchFieldLimit v-model="model" />
  <SearchFieldDivider />
  <SearchFieldLandCategory v-model="model" />
</template>
