<script setup lang="ts">
import CardSearchFieldName from '~~/app/components/organisms/cards/search/CardSearchFieldName.vue'
import CardSearchFieldElement from '~~/app/components/organisms/cards/search/CardSearchFieldElement.vue'
import CardSearchFieldDivider from '~~/app/components/atoms/common/CardSearchFieldDivider.vue'
import CardSearchFieldCardCategory from '~~/app/components/organisms/cards/search/CardSearchFieldCardCategory.vue'
import CardSearchFieldCardType from '~~/app/components/organisms/cards/search/CardSearchFieldCardType.vue'
import CardSearchFieldKeyword from '~~/app/components/organisms/cards/search/CardSearchFieldKeyword.vue'
import CardSearchFieldLevel from '~~/app/components/organisms/cards/search/CardSearchFieldLevel.vue'
import CardSearchFieldAttack from '~~/app/components/organisms/cards/search/CardSearchFieldAttack.vue'
import CardSearchFieldDefence from '~~/app/components/organisms/cards/search/CardSearchFieldDefence.vue'
import CardSearchFieldInitiative from '~~/app/components/organisms/cards/search/CardSearchFieldInitiative.vue'
import CardSearchFieldCharge from '~~/app/components/organisms/cards/search/CardSearchFieldCharge.vue'
import CardSearchFieldDefender from '~~/app/components/organisms/cards/search/CardSearchFieldDefender.vue'
import CardSearchFieldProduct from '~~/app/components/organisms/cards/search/CardSearchFieldProduct.vue'
import CardSearchFieldLimit from '~~/app/components/organisms/cards/search/CardSearchFieldLimit.vue'
import CardSearchFieldFaction from '~~/app/components/organisms/cards/search/CardSearchFieldFaction.vue'
import CardSearchFieldBlock from '~~/app/components/organisms/cards/search/CardSearchFieldBlock.vue'
import CardSearchFieldReferenceLabel from '~~/app/components/organisms/cards/search/CardSearchFieldReferenceLabel.vue'
import CardSearchFieldIllustrator from '~~/app/components/organisms/cards/search/CardSearchFieldIllustrator.vue'
import CardSearchFieldMoveType from '~~/app/components/organisms/cards/search/CardSearchFieldMoveType.vue'
import CardSearchFieldRarity from '~~/app/components/organisms/cards/search/CardSearchFieldRarity.vue'
import CardSearchFieldHero from '~~/app/components/organisms/cards/search/CardSearchFieldHero.vue'
import CardSearchFieldLandCategory from '~~/app/components/organisms/cards/search/CardSearchFieldLandCategory.vue'
import CardSearchFieldResistance from '~~/app/components/organisms/cards/search/CardSearchFieldResistance.vue'
import CardSearchFieldAbilitySlotSpell from '~~/app/components/organisms/cards/search/CardSearchFieldAbilitySlotSpell.vue'
import CardSearchFieldAbilitySlotItem from '~~/app/components/organisms/cards/search/CardSearchFieldAbilitySlotItem.vue'
import CardSearchFieldCostSlotSpell from '~~/app/components/organisms/cards/search/CardSearchFieldCostSlotSpell.vue'
import CardSearchFieldCostSlotItem from '~~/app/components/organisms/cards/search/CardSearchFieldCostSlotItem.vue'
import CardSearchFieldEffectActivationCategory from '~~/app/components/organisms/cards/search/CardSearchFieldEffectActivationCategory.vue'
import CardSearchFieldEffectActivationType from '~~/app/components/organisms/cards/search/CardSearchFieldEffectActivationType.vue'
import CardSearchFieldEffectText from '~~/app/components/organisms/cards/search/CardSearchFieldEffectText.vue'
import CardSearchFieldEffectType from '~~/app/components/organisms/cards/search/CardSearchFieldEffectType.vue'
import CardSearchFieldCostOther from '~~/app/components/organisms/cards/search/CardSearchFieldCostOther.vue'



import type { SearchForm } from '~~/app/types/ui/search'

// 親から渡されたモデルを各フィールドに分配する
const model = defineModel<SearchForm>({ required: true })
</script>

<template>
  <CardSearchFieldCostSlotItem v-model="model" />
  <CardSearchFieldDivider />
  <CardSearchFieldCostSlotSpell v-model="model" />
  <CardSearchFieldDivider />
  <CardSearchFieldCostOther v-model="model" />
  <CardSearchFieldDivider />
  <CardSearchFieldEffectType v-model="model" />
  <CardSearchFieldDivider />
  <CardSearchFieldEffectActivationType v-model="model" />
  <CardSearchFieldDivider />
  <CardSearchFieldEffectActivationCategory v-model="model" />
  <CardSearchFieldDivider />
  <CardSearchFieldEffectText v-model="model" />
</template>
