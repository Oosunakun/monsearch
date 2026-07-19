<script setup lang="ts">
import SearchFieldDivider from '~~/app/components/cards/search/shared/SearchFieldDivider.vue'
import SearchFieldProduct from '~~/app/components/cards/search/origin/SearchFieldProduct.vue'
import SearchFieldFaction from '~~/app/components/cards/search/origin/SearchFieldFaction.vue'
import SearchFieldBlock from '~~/app/components/cards/search/origin/SearchFieldBlock.vue'

import type { SearchForm } from '~~/app/types/ui/search'

// 親から渡されたモデルを各フィールドに分配する
const model = defineModel<SearchForm>({ required: true })
</script>

<template>
  <SearchFieldProduct v-model="model" />
  <SearchFieldDivider />
  <SearchFieldFaction v-model="model" />
  <SearchFieldDivider />
  <SearchFieldBlock v-model="model" />
</template>
