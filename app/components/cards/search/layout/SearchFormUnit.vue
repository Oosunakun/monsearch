<script setup lang="ts">
import SearchFieldDivider from '~~/app/components/cards/search/shared/SearchFieldDivider.vue'
import SearchFieldRace from '~~/app/components/cards/search/unit/SearchFieldRace.vue'
import SearchFieldLevel from '~~/app/components/cards/search/unit/SearchFieldLevel.vue'
import SearchFieldAttack from '~~/app/components/cards/search/unit/SearchFieldAttack.vue'
import SearchFieldDefence from '~~/app/components/cards/search/unit/SearchFieldDefence.vue'
import SearchFieldInitiative from '~~/app/components/cards/search/unit/SearchFieldInitiative.vue'
import SearchFieldCharge from '~~/app/components/cards/search/unit/SearchFieldCharge.vue'
import SearchFieldDefender from '~~/app/components/cards/search/unit/SearchFieldDefender.vue'
import SearchFieldMoveType from '~~/app/components/cards/search/unit/SearchFieldMoveType.vue'
import SearchFieldHero from '~~/app/components/cards/search/unit/SearchFieldHero.vue'
import SearchFieldResistance from '~~/app/components/cards/search/unit/SearchFieldResistance.vue'
import SearchFieldAbilitySlotSpell from '~~/app/components/cards/search/unit/SearchFieldAbilitySlotSpell.vue'
import SearchFieldAbilitySlotItem from '~~/app/components/cards/search/unit/SearchFieldAbilitySlotItem.vue'

import type { SearchForm } from '~~/app/types/ui/search'

// 親から渡されたモデルを各フィールドに分配する
const model = defineModel<SearchForm>({ required: true })
</script>

<template>
  <SearchFieldLevel v-model="model" />
  <SearchFieldDivider />
  <SearchFieldHero v-model="model" />
  <SearchFieldDivider />
  <SearchFieldAttack v-model="model" />
  <SearchFieldDivider />
  <SearchFieldDefence v-model="model" />
  <SearchFieldDivider />
  <SearchFieldMoveType v-model="model" />
  <SearchFieldDivider />
  <SearchFieldRace v-model="model" />
  <SearchFieldDivider />
  <SearchFieldAbilitySlotItem v-model="model" />
  <SearchFieldDivider />
  <SearchFieldAbilitySlotSpell v-model="model" />
  <SearchFieldDivider />
  <SearchFieldInitiative v-model="model" />
  <SearchFieldDivider />
  <SearchFieldCharge v-model="model" />
  <SearchFieldDivider />
  <SearchFieldDefender v-model="model" />
  <SearchFieldDivider />
  <SearchFieldResistance v-model="model" />
</template>
