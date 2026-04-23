<script setup lang="ts">
type SelectOption = {
  title: string
  value: string
}

type ElementOption = {
  label: string
  value: string
  color: string
}

type SearchResultRow = {
  id: string
  setCode: string
  cardName: string
  category: string
  race: string
  element: string
  level: number
  attack: number
  defense: number
  rarity: string
  zebra: boolean
}

type SearchResultSource = Omit<SearchResultRow, 'zebra'>

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

const headers = [
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

const cardName = ref('')
const selectedCategory = ref('unit')
const selectedRarity = ref('S')
const selectedCardPool = ref('open')
const selectedSet = ref('6D')

const levelFrom = ref<number | null>(1)
const levelTo = ref<number | null>(8)
const attackFrom = ref<number | null>(1)
const attackTo = ref<number | null>(10)
const defenseFrom = ref<number | null>(1)
const defenseTo = ref<number | null>(10)
const selectedMoveType = ref('flying')
const selectedElements = ref<string[]>([])

const raceKeyword = ref('')
const cardTypeKeyword = ref('')
const keyword = ref('')

const sourceRows: SearchResultSource[] = [
  { id: '1', setCode: '6D', cardName: '蒼穹の古龍', category: 'ユニット', race: 'ドラゴン', element: '火', level: 6, attack: 7, defense: 6, rarity: 'S' },
  { id: '2', setCode: '6D', cardName: '烈風のドレイク', category: 'ユニット', race: 'ドラゴン', element: '風', level: 5, attack: 6, defense: 4, rarity: 'R' },
  { id: '3', setCode: '6C', cardName: '黒曜のギガンテス', category: 'ユニット', race: 'ジャイアント', element: '土', level: 4, attack: 5, defense: 6, rarity: 'UC' },
  { id: '4', setCode: '5D', cardName: '聖盾のパラディン', category: 'ユニット', race: 'ヒューマン', element: '聖', level: 5, attack: 4, defense: 6, rarity: 'UC' },
  { id: '5', setCode: '4B', cardName: '焔刃のサラマンダー', category: 'ユニット', race: 'サラマンダー', element: '火', level: 4, attack: 5, defense: 3, rarity: 'R' }
]

const results = computed<SearchResultRow[]>(() =>
  sourceRows.map((row, index) => ({
    ...row,
    zebra: index % 2 === 1
  }))
)

const resetConditions = () => {
  cardName.value = ''
  selectedCategory.value = 'unit'
  selectedRarity.value = 'S'
  selectedCardPool.value = 'open'
  selectedSet.value = '6D'
  levelFrom.value = 1
  levelTo.value = 8
  attackFrom.value = 1
  attackTo.value = 10
  defenseFrom.value = 1
  defenseTo.value = 10
  selectedMoveType.value = 'flying'
  selectedElements.value = []
  raceKeyword.value = ''
  cardTypeKeyword.value = ''
  keyword.value = ''
}

const runSearch = () => {
  // モック段階のためローカルデータ表示のみ
}
</script>

<template>
  <section>
    <h2 class="text-h4 font-weight-bold mb-4" style="color: #3E2723;">
      詳細検索
    </h2>

    <v-form class="d-flex flex-column ga-4" @submit.prevent="runSearch">
      <v-card variant="outlined">
        <v-sheet color="secondary" class="px-4 py-2 text-subtitle-2 font-weight-bold">
          基本情報
        </v-sheet>
        <v-card-text>
          <v-row dense>
            <v-col cols="12" lg="8">
              <v-text-field
                v-model="cardName"
                label="カード名"
                placeholder="例: ドラゴンナイト"
                variant="outlined"
                density="comfortable"
                hide-details
              />
            </v-col>
            <v-col cols="12" lg="4">
              <v-select
                v-model="selectedCategory"
                :items="categoryOptions"
                item-title="title"
                item-value="value"
                label="カテゴリ"
                variant="outlined"
                density="comfortable"
                hide-details
              />
            </v-col>
            <v-col cols="12" lg="4">
              <v-select
                v-model="selectedRarity"
                :items="rarityOptions"
                item-title="title"
                item-value="value"
                label="レアリティ"
                variant="outlined"
                density="comfortable"
                hide-details
              />
            </v-col>
            <v-col cols="12" lg="4">
              <v-select
                v-model="selectedCardPool"
                :items="cardPoolOptions"
                item-title="title"
                item-value="value"
                label="カードプール"
                variant="outlined"
                density="comfortable"
                hide-details
              />
            </v-col>
            <v-col cols="12" lg="4">
              <v-select
                v-model="selectedSet"
                :items="setOptions"
                item-title="title"
                item-value="value"
                label="セット"
                variant="outlined"
                density="comfortable"
                hide-details
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-card variant="outlined">
        <v-sheet color="secondary" class="px-4 py-2 text-subtitle-2 font-weight-bold">
          ユニット情報
        </v-sheet>
        <v-card-text>
          <v-row dense>
            <v-col cols="12" md="4">
              <div class="d-flex ga-2">
                <v-text-field v-model.number="levelFrom" label="レベル From" type="number" variant="outlined" density="comfortable" hide-details />
                <v-text-field v-model.number="levelTo" label="To" type="number" variant="outlined" density="comfortable" hide-details />
              </div>
            </v-col>
            <v-col cols="12" md="4">
              <div class="d-flex ga-2">
                <v-text-field v-model.number="attackFrom" label="攻撃力 From" type="number" variant="outlined" density="comfortable" hide-details />
                <v-text-field v-model.number="attackTo" label="To" type="number" variant="outlined" density="comfortable" hide-details />
              </div>
            </v-col>
            <v-col cols="12" md="4">
              <div class="d-flex ga-2">
                <v-text-field v-model.number="defenseFrom" label="防御力 From" type="number" variant="outlined" density="comfortable" hide-details />
                <v-text-field v-model.number="defenseTo" label="To" type="number" variant="outlined" density="comfortable" hide-details />
              </div>
            </v-col>
            <v-col cols="12" md="4">
              <v-select
                v-model="selectedMoveType"
                :items="moveTypeOptions"
                item-title="title"
                item-value="value"
                label="移動タイプ"
                variant="outlined"
                density="comfortable"
                hide-details
              />
            </v-col>
          </v-row>
          <p class="text-caption font-weight-bold mt-4 mb-2">
            属性（複数選択）
          </p>
          <div class="d-flex flex-wrap ga-2">
            <v-chip
              v-for="element in elementOptions"
              :key="element.value"
              :color="element.color"
              :variant="selectedElements.includes(element.value) ? 'flat' : 'outlined'"
              :prepend-icon="selectedElements.includes(element.value) ? 'mdi-check' : undefined"
              @click="selectedElements = selectedElements.includes(element.value) ? selectedElements.filter((v) => v !== element.value) : [...selectedElements, element.value]"
            >
              {{ element.label }}
            </v-chip>
          </div>
        </v-card-text>
      </v-card>

      <v-card variant="outlined">
        <v-sheet color="secondary" class="px-4 py-2 text-subtitle-2 font-weight-bold">
          種族・タイプ
        </v-sheet>
        <v-card-text>
          <v-row dense>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="raceKeyword"
                label="種族"
                placeholder="例: ドラゴン"
                variant="outlined"
                density="comfortable"
                hide-details
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="cardTypeKeyword"
                label="カードタイプ"
                placeholder="例: 英雄点持ちユニット"
                variant="outlined"
                density="comfortable"
                hide-details
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-card variant="outlined">
        <v-sheet color="secondary" class="px-4 py-2 text-subtitle-2 font-weight-bold">
          キーワード
        </v-sheet>
        <v-card-text>
          <v-text-field
            v-model="keyword"
            label="キーワード"
            placeholder="例: 即時召喚"
            variant="outlined"
            density="comfortable"
            hide-details
          />
        </v-card-text>
      </v-card>

      <div class="d-flex flex-wrap ga-3">
        <v-btn color="primary" size="large" type="submit">
          検索する
        </v-btn>
        <v-btn color="grey-darken-1" size="large" @click="resetConditions">
          条件をリセット
        </v-btn>
      </div>
    </v-form>

    <v-sheet color="secondary" class="px-4 py-2 text-subtitle-2 font-weight-bold mt-6 mb-3">
      検索結果
    </v-sheet>
    <p class="text-subtitle-1 font-weight-bold mb-2" style="color: #3E2723;">
      {{ results.length }}件
    </p>

    <v-card variant="outlined">
      <v-data-table
        :headers="headers"
        :items="results"
        item-value="id"
        fixed-header
        height="520"
        density="comfortable"
        hide-default-footer
        items-per-page="-1"
        class="search-table"
      >
        <template #item="{ item }">
          <tr class="search-table__row" :class="{ 'search-table__row--zebra': item.zebra }">
            <td class="px-2 py-2">{{ item.setCode }}</td>
            <td class="px-2 py-2"><span class="text-accent">{{ item.cardName }}</span></td>
            <td class="px-2 py-2">{{ item.category }}</td>
            <td class="px-2 py-2">{{ item.race }}</td>
            <td class="px-2 py-2">{{ item.element }}</td>
            <td class="px-2 py-2">{{ item.level }}</td>
            <td class="px-2 py-2">{{ item.attack }}</td>
            <td class="px-2 py-2">{{ item.defense }}</td>
            <td class="px-2 py-2">{{ item.rarity }}</td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </section>
</template>

<style scoped>
.search-table :deep(thead th) {
  position: sticky;
  top: 0;
  z-index: 2;
  background: rgb(var(--v-theme-primary));
  color: #ffffff;
  font-weight: 700;
}

.search-table :deep(tbody tr td) {
  border-bottom: 1px solid #eef3e4;
}

.search-table__row--zebra td {
  background: #f8fbf1;
}

.search-table__row:hover td {
  background: #eef7e3;
}
</style>
