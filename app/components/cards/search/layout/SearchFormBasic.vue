<script setup lang="ts">
import SearchFieldName from '~~/app/components/cards/search/basic/SearchFieldName.vue'
import SearchFieldElement from '~~/app/components/cards/search/basic/SearchFieldElement.vue'
import SearchFieldDivider from '~~/app/components/cards/search/shared/SearchFieldDivider.vue'
import SearchFieldCardCategory from '~~/app/components/cards/search/basic/SearchFieldCardCategory.vue'
import SearchFieldCardType from '~~/app/components/cards/search/basic/SearchFieldCardType.vue'
import SearchFieldArchetypeText from '~~/app/components/cards/search/basic/SearchFieldArchetypeText.vue'
import SearchFieldKeyword from '~~/app/components/cards/search/basic/SearchFieldKeyword.vue'

import type { SearchForm } from '~~/app/types/ui/search'

// 親から渡されたモデルを各フィールドに分配する
const model = defineModel<SearchForm>({ required: true })
const emit = defineEmits<{ submit: [] }>()
</script>

<template>
  <SearchFieldName v-model="model" @submit="emit('submit')" />
  <SearchFieldDivider />
  <SearchFieldCardCategory v-model="model" />
  <SearchFieldDivider />
  <SearchFieldElement v-model="model" />
  <SearchFieldDivider />
  <SearchFieldCardType v-model="model" />
  <SearchFieldDivider />
  <SearchFieldArchetypeText v-model="model" @submit="emit('submit')" />
  <SearchFieldDivider />
  <SearchFieldKeyword v-model="model" @submit="emit('submit')" />
</template>

