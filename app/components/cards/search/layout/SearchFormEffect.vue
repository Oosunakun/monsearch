<script setup lang="ts">
import SearchFieldDivider from '~~/app/components/cards/search/shared/SearchFieldDivider.vue'
import SearchFieldCostSlotSpell from '~~/app/components/cards/search/effect/SearchFieldCostSlotSpell.vue'
import SearchFieldCostSlotItem from '~~/app/components/cards/search/effect/SearchFieldCostSlotItem.vue'
import SearchFieldEffectActivationCategory from '~~/app/components/cards/search/effect/SearchFieldEffectActivationCategory.vue'
import SearchFieldEffectActivationType from '~~/app/components/cards/search/effect/SearchFieldEffectActivationType.vue'
import SearchFieldEffectText from '~~/app/components/cards/search/effect/SearchFieldEffectText.vue'
import SearchFieldEffectType from '~~/app/components/cards/search/effect/SearchFieldEffectType.vue'
import SearchFieldCostOther from '~~/app/components/cards/search/effect/SearchFieldCostOther.vue'

import type { SearchForm } from '~~/app/types/ui/search'

// 親から渡されたモデルを各フィールドに分配する
const model = defineModel<SearchForm>({ required: true })
const emit = defineEmits<{ submit: [] }>()
</script>

<template>
  <SearchFieldCostSlotItem v-model="model" />
  <SearchFieldDivider />
  <SearchFieldCostSlotSpell v-model="model" />
  <SearchFieldDivider />
  <SearchFieldCostOther v-model="model" />
  <SearchFieldDivider />
  <SearchFieldEffectType v-model="model" />
  <SearchFieldDivider />
  <SearchFieldEffectActivationType v-model="model" />
  <SearchFieldDivider />
  <SearchFieldEffectActivationCategory v-model="model" />
  <SearchFieldDivider />
  <SearchFieldEffectText v-model="model" @submit="emit('submit')" />
</template>
