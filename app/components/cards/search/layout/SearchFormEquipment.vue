<script setup lang="ts">
import SearchFieldDivider from '~~/app/components/cards/search/shared/SearchFieldDivider.vue'
import SearchFieldAdditionalAttack from '~~/app/components/cards/search/equipment/SearchFieldAdditionalAttack.vue'
import SearchFieldAdditionalDefense from '~~/app/components/cards/search/equipment/SearchFieldAdditionalDefense.vue'
import SearchFieldAdditionalInitiative from '~~/app/components/cards/search/equipment/SearchFieldAdditionalInitiative.vue'
import SearchFieldAdditionalCharge from '~~/app/components/cards/search/equipment/SearchFieldAdditionalCharge.vue'
import SearchFieldAdditionalDefender from '~~/app/components/cards/search/equipment/SearchFieldAdditionalDefender.vue'
import SearchFieldAdditionalResistance from '~~/app/components/cards/search/equipment/SearchFieldAdditionalResistance.vue'
import SearchFieldAdditionalAbilitySlotSpell from '~~/app/components/cards/search/equipment/SearchFieldAdditionalAbilitySlotSpell.vue'
import SearchFieldAdditionalAbilitySlotItem from '~~/app/components/cards/search/equipment/SearchFieldAdditionalAbilitySlotItem.vue'

import type { SearchForm } from '~~/app/types/ui/search'

// 親から渡されたモデルを各フィールドに分配する
const model = defineModel<SearchForm>({ required: true })
</script>

<template>
  <SearchFieldAdditionalAttack v-model="model" />
  <SearchFieldDivider />
  <SearchFieldAdditionalDefense v-model="model" />
  <SearchFieldDivider />
  <SearchFieldAdditionalAbilitySlotItem v-model="model" />
  <SearchFieldDivider />
  <SearchFieldAdditionalAbilitySlotSpell v-model="model" />
  <SearchFieldDivider />
  <SearchFieldAdditionalInitiative v-model="model" />
  <SearchFieldDivider />
  <SearchFieldAdditionalCharge v-model="model" />
  <SearchFieldDivider />
  <SearchFieldAdditionalDefender v-model="model" />
  <SearchFieldDivider />
  <SearchFieldAdditionalResistance v-model="model" />
</template>
