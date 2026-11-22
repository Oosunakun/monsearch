<script setup lang="ts">
import SearchFieldDivider from '~~/app/components/cards/search/shared/SearchFieldDivider.vue'
import SearchFieldReferenceLabel from '~~/app/components/cards/search/other/SearchFieldReferenceLabel.vue'
import SearchFieldIllustrator from '~~/app/components/cards/search/other/SearchFieldIllustrator.vue'
import SearchFieldRarity from '~~/app/components/cards/search/other/SearchFieldRarity.vue'

import type { SearchForm } from '~~/app/types/ui/search'

// 親から渡されたモデルを各フィールドに分配する
const model = defineModel<SearchForm>({ required: true })
const emit = defineEmits<{ submit: [] }>()
</script>

<template>
  <SearchFieldRarity v-model="model" />
  <SearchFieldDivider />
  <SearchFieldIllustrator v-model="model" />
  <SearchFieldDivider />
  <SearchFieldReferenceLabel v-model="model" @submit="emit('submit')" />
</template>
