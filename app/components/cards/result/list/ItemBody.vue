<script setup lang="ts">
import { computed } from 'vue'
import type { CardSearchResultItem } from '~~/server/types/cardSearch'
import type { AffinitySet } from '~~/types/cards/finderCards'

const props = defineProps<{
  card: CardSearchResultItem
}>()

// ---- ヘルパー関数 ----

const formatStatValue = (val: number | undefined | null): string => {
  if (val === undefined || val === null) return ''
  const signedValue = val >= 0 ? `+${val}` : `${val}`
  // プラス・マイナスは全角で表示する
  return signedValue.replace(/\+/g, '＋').replace(/-/g, '－')
}

const getAffinityText = (affinities: AffinitySet[]): string[] => {
  const resistances = affinities.filter(a => a.affinity.affinity_category_code === 'Resistance')
  if (resistances.length === 0) return []

  const categoryName = resistances[0]?.affinity.affinity_category_name
  const categoryInfo: string[] = []

  resistances.forEach(({ affinity, affinity_value }) => {
    if (!affinity.damage_source_name && !affinity.damage_attribute_name) return
    const source = affinity.damage_source_name || affinity.damage_attribute_name || ''
    switch (affinity.affinity_modifier_type_code) {
      case 'DamageIncrease': categoryInfo.push(`${source}(${affinity_value}増)`); break
      case 'DamageDecrease': categoryInfo.push(`${source}(${affinity_value}減)`); break
      case 'DamageBlock':    categoryInfo.push(source); break
    }
  })

  return [`${categoryName}：${categoryInfo.join('／')}`]
}

// ---- ability取得 ----
type RawAbility = NonNullable<CardSearchResultItem['unit']>['ability']
const getAbility = (type: 'unit' | 'item'): RawAbility | undefined =>
  type === 'unit'
    ? props.card.unit?.ability
    : props.card.item?.equip?.ability

// ---- スロット文字列（unit/item共通で同じソースを参照） ----
const getSlotTextByCategory = (categoryCode: 'Item' | 'Spell'): string => {
  const slots =
    props.card.unit?.ability?.ability_slots ??
    props.card.item?.equip?.ability?.ability_slots
  if (!slots) return ''
  return slots
    .filter(s => s.ability_slot_category_code === categoryCode)
    .map(s => s.ability_slot_type_name.repeat(s.slot_count))
    .join('')
}
const itemSlotText = computed(() => getSlotTextByCategory('Item'))
const spellSlotText = computed(() => getSlotTextByCategory('Spell'))

// ---- 共通ファクトリ ----
const createDisplayData = (type: 'unit' | 'item') => {
  const ability = computed(() => getAbility(type))

  const stats = computed(() => ({
    initiative: formatStatValue(ability.value?.initiative),
    charge:     formatStatValue(ability.value?.charge),
    defender:   formatStatValue(ability.value?.defender),
  }))

  const affinities = computed(() =>
    ability.value?.affinities ? getAffinityText(ability.value.affinities) : []
  )

  const hasStats = computed(() =>
    !!ability.value?.initiative ||
    !!ability.value?.charge ||
    !!ability.value?.defender ||
    !!ability.value?.ability_slots.length ||
    !!ability.value?.affinities.length
  )
  
  return { ability, stats, affinities, hasStats }
}

// ---- 各インスタンス ----
const unitDisplay = createDisplayData('unit')
const itemDisplay = createDisplayData('item')
</script>

<template>
  <div class="card-item-body px-1">

    <!-- ユニット能力 -->
    <div
      v-if="unitDisplay.hasStats.value"
      class="stats-chip-container d-flex flex-wrap"
    >
      <span v-if="unitDisplay.ability.value?.initiative" class="stat-pill-chip">
        イニシアチブ：{{ unitDisplay.stats.value.initiative }}
      </span>
      <span v-if="unitDisplay.ability.value?.charge" class="stat-pill-chip">
        チャージ：{{ unitDisplay.stats.value.charge }}
      </span>
      <span v-if="unitDisplay.ability.value?.defender" class="stat-pill-chip">
        ディフェンダー：{{ unitDisplay.stats.value.defender }}
      </span>
      <span v-if="itemSlotText" class="stat-pill-chip">
        アイテム：{{ itemSlotText }}
      </span>
      <span v-if="spellSlotText" class="stat-pill-chip">
        スペル：{{ spellSlotText }}
      </span>
      <span
        v-for="(aff, idx) in unitDisplay.affinities.value"
        :key="idx"
        class="stat-pill-chip"
      >
        {{ aff }}
      </span>
    </div>

    <!-- 装備アイテム能力 -->
    <div
      v-if="itemDisplay.hasStats.value"
      class="stats-chip-container d-flex flex-wrap"
    >
      <template v-if="card.item?.equip?.ability">
        <span v-if="itemDisplay.ability.value?.initiative" class="stat-pill-chip">
          イニシアチブ：{{ itemDisplay.stats.value.initiative }}
        </span>
        <span v-if="itemDisplay.ability.value?.charge" class="stat-pill-chip">
          チャージ：{{ itemDisplay.stats.value.charge }}
        </span>
        <span v-if="itemDisplay.ability.value?.defender" class="stat-pill-chip">
          ディフェンダー：{{ itemDisplay.stats.value.defender }}
        </span>
        <span v-if="itemSlotText" class="stat-pill-chip">
          アイテム：{{ itemSlotText }}
        </span>
        <span v-if="spellSlotText" class="stat-pill-chip">
          スペル：{{ spellSlotText }}
        </span>
        <span
          v-for="(aff, idx) in itemDisplay.affinities.value"
          :key="idx"
          class="stat-pill-chip"
        >
          {{ aff }}
        </span>
      </template>
    </div>

  </div>
</template>
<style scoped>
.card-item-body {
  margin-bottom: 2px;
}

/* 各Chipを横並びにするコンテナ（既存のまま） */
.stats-chip-container {
  width: 100%;
  white-space: nowrap;
}

/* ── 💡 修正：実カード準拠の共通カプセル（ピル）型Chip ── */
.stat-pill-chip {
  font-family: sans-serif;
  font-size: 0.70rem;
  font-weight: bold;
  background: linear-gradient(to bottom, #ffffff, #f0f0f0);
  color: #333333;
  border: 1px solid #cccccc;
  padding: 1px 10px;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 0.025rem;
  
  box-shadow: 0 0.25px 0.25px rgba(0, 0, 0, 0.1);
  margin: 2px 4px 2px 0;
}
</style>
