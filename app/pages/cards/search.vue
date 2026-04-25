<script setup lang="ts">
import type {
  ElementOption,
  SearchResultHeader,
  SearchResultSource,
  SelectOption
} from '~~/app/types/ui/search'
import CardSearchFormBasic from '~~/app/components/organisms/cards/CardSearchFormBasic.vue'
import CardSearchFormUnit from '~~/app/components/organisms/cards/CardSearchFormUnit.vue'
import CardSearchFormRaceType from '~~/app/components/organisms/cards/CardSearchFormRaceType.vue'
import CardSearchFormKeyword from '~~/app/components/organisms/cards/CardSearchFormKeyword.vue'
import CardSearchResultTable from '~~/app/components/organisms/cards/CardSearchResultTable.vue'
import AppSectionHeader from '~~/app/components/atoms/common/AppSectionHeader.vue'

const categoryOptions: SelectOption[] = [
  { title: 'ユニット', value: 'unit' },
  { title: 'スペル', value: 'spell' },
  { title: '地形', value: 'terrain' }
]

const rarityOptions: SelectOption[] = [
  { title: 'Sレア', value: 'S' },
  { title: 'R', value: 'R' },
  { title: 'UC', value: 'UC' },
  { title: 'C', value: 'C' }
]

const cardPoolOptions: SelectOption[] = [
  { title: 'オープン', value: 'open' },
  { title: 'ネオスタン', value: 'neo-stand' }
]

const setOptions: SelectOption[] = [
  { title: '6D 悠久のハルシオン', value: '6D' },
  { title: '6C アゾールの黒い旋風', value: '6C' },
  { title: '6B 紅河の戦慄', value: '6B' }
]

const moveTypeOptions: SelectOption[] = [
  { title: '飛行', value: 'flying' },
  { title: '歩行', value: 'walk' }
]

const elementOptions: ElementOption[] = [
  { label: '火', value: 'fire', color: 'red' },
  { label: '水', value: 'water', color: 'blue' },
  { label: '土', value: 'earth', color: 'light-green' },
  { label: '風', value: 'wind', color: 'green' },
  { label: '聖', value: 'holy', color: 'amber' },
  { label: '魔', value: 'dark', color: 'purple' },
  { label: '喰', value: 'eat', color: 'brown' },
  { label: '獣', value: 'beast', color: 'deep-orange' },
  { label: '荒', value: 'wild', color: 'blue-grey' },
  { label: '機', value: 'machine', color: 'cyan' }
]

const headers: SearchResultHeader[] = [
  { title: 'セット', key: 'setCode', sortable: false },
  { title: 'カード名', key: 'cardName', sortable: false },
  { title: 'カテゴリ', key: 'category', sortable: false },
  { title: '種族', key: 'race', sortable: false },
  { title: '属性', key: 'element', sortable: false },
  { title: 'Lv', key: 'level', sortable: false },
  { title: '攻', key: 'attack', sortable: false },
  { title: '防', key: 'defense', sortable: false },
  { title: 'レア', key: 'rarity', sortable: false }
]

const sourceRows: SearchResultSource[] = [
  { id: '1', setCode: '6D', cardName: '蒼穹の古龍', category: 'ユニット', race: 'ドラゴン', element: '火', level: 6, attack: 7, defense: 6, rarity: 'S' },
  { id: '2', setCode: '6D', cardName: '烈風のドレイク', category: 'ユニット', race: 'ドラゴン', element: '風', level: 5, attack: 6, defense: 4, rarity: 'R' },
  { id: '3', setCode: '6C', cardName: '黒曜のギガンテス', category: 'ユニット', race: 'ジャイアント', element: '土', level: 4, attack: 5, defense: 6, rarity: 'UC' },
  { id: '4', setCode: '5D', cardName: '聖盾のパラディン', category: 'ユニット', race: 'ヒューマン', element: '聖', level: 5, attack: 4, defense: 6, rarity: 'UC' },
  { id: '5', setCode: '4B', cardName: '焔刃のサラマンダー', category: 'ユニット', race: 'サラマンダー', element: '火', level: 4, attack: 5, defense: 3, rarity: 'R' }
]

const { formState, resetForm, toSearchRequestDto, withZebraRows } = useCardSearchForm()
const results = computed(() => withZebraRows(sourceRows))

const resetConditions = () => {
  resetForm()
}

const runSearch = () => {
  const payload = toSearchRequestDto()
  console.info('mock search payload', payload)
}
</script>

<template>
  <section>
    <h2 class="text-h4 font-weight-bold mb-4" style="color: #3E2723;">
      詳細検索
    </h2>

    <v-form class="d-flex flex-column ga-4" @submit.prevent="runSearch">
      <v-expansion-panels multiple variant="accordion">
        <v-expansion-panel title="検索条件">
          <v-expansion-panel-text>
            <div class="d-flex flex-column ga-4">
              <CardSearchFormBasic
                :model-value="formState.basic"
                :category-options="categoryOptions"
                :rarity-options="rarityOptions"
                :card-pool-options="cardPoolOptions"
                :set-options="setOptions"
                @update:model-value="formState.basic = $event"
              />
              <CardSearchFormUnit
                :model-value="formState.unit"
                :move-type-options="moveTypeOptions"
                :element-options="elementOptions"
                @update:model-value="formState.unit = $event"
              />
              <CardSearchFormRaceType
                :model-value="formState.raceType"
                @update:model-value="formState.raceType = $event"
              />
              <CardSearchFormKeyword
                :model-value="formState.keyword"
                @update:model-value="formState.keyword = $event"
              />
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>

      <div class="d-flex flex-wrap ga-3">
        <v-btn color="primary" size="large" type="submit">
          検索する
        </v-btn>
        <v-btn color="grey-darken-1" size="large" @click="resetConditions">
          条件をリセット
        </v-btn>
      </div>
    </v-form>

    <AppSectionHeader title="検索結果" class="mt-6 mb-3" />
    <p class="text-subtitle-1 font-weight-bold mb-2" style="color: #3E2723;">
      {{ results.length }}件
    </p>

    <CardSearchResultTable :headers="headers" :items="results" />
  </section>
</template>
