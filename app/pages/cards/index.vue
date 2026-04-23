<script setup lang="ts">
import type { CardDetail, ElementCode } from '~~/types/card'

type SearchCondition = {
  id: string
  label: string
}

type CardRow = {
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

type CardSource = Omit<CardRow, 'zebra'>

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

const activeConditions = ref<SearchCondition[]>([
  { id: 'name', label: 'カード名: ドラゴン' },
  { id: 'pool', label: 'カードプール: オープン' },
  { id: 'element', label: '属性: 火/風' }
])

const sourceRows: CardSource[] = [
  { id: '1', setCode: '6D', cardName: '蒼穹の古龍', category: 'ユニット', race: 'ドラゴン', element: '火', level: 6, attack: 7, defense: 6, rarity: 'S' },
  { id: '2', setCode: '6D', cardName: '烈風のドレイク', category: 'ユニット', race: 'ドラゴン', element: '風', level: 5, attack: 6, defense: 4, rarity: 'R' },
  { id: '3', setCode: '6C', cardName: '黒曜のギガンテス', category: 'ユニット', race: 'ジャイアント', element: '土', level: 4, attack: 5, defense: 6, rarity: 'UC' },
  { id: '4', setCode: '6C', cardName: '潮騒のマーメイド', category: 'ユニット', race: 'マーメイド', element: '水', level: 3, attack: 3, defense: 2, rarity: 'C' },
  { id: '5', setCode: '6B', cardName: '雷牙のワイバーン', category: 'ユニット', race: 'ワイバーン', element: '風', level: 4, attack: 5, defense: 3, rarity: 'R' },
  { id: '6', setCode: '6B', cardName: '奈落のデモンロード', category: 'ユニット', race: 'デーモン', element: '魔', level: 7, attack: 8, defense: 7, rarity: 'S' },
  { id: '7', setCode: '5D', cardName: '聖盾のパラディン', category: 'ユニット', race: 'ヒューマン', element: '聖', level: 5, attack: 4, defense: 6, rarity: 'UC' },
  { id: '8', setCode: '5C', cardName: '機鋼のアームズマン', category: 'ユニット', race: 'ウォリアー', element: '機', level: 2, attack: 2, defense: 3, rarity: 'C' },
  { id: '9', setCode: '5C', cardName: '喰月のハウンド', category: 'ユニット', race: 'ビースト', element: '喰', level: 3, attack: 4, defense: 2, rarity: 'R' },
  { id: '10', setCode: '4D', cardName: '荒野のケンタウロス', category: 'ユニット', race: 'ケンタウロス', element: '荒', level: 3, attack: 4, defense: 3, rarity: 'UC' },
  { id: '11', setCode: '4C', cardName: '深海のオクトパス', category: 'ユニット', race: 'アクアリウム', element: '水', level: 2, attack: 1, defense: 3, rarity: 'C' },
  { id: '12', setCode: '4B', cardName: '焔刃のサラマンダー', category: 'ユニット', race: 'サラマンダー', element: '火', level: 4, attack: 5, defense: 3, rarity: 'R' }
]

const cardRows = computed<CardRow[]>(() =>
  sourceRows.map((row, index) => ({
    ...row,
    zebra: index % 2 === 1
  }))
)

const detailModalOpen = ref(false)
const selectedCard = ref<CardDetail | null>(null)

const elementMap: Record<string, ElementCode> = {
  火: 'Fire',
  水: 'Water',
  土: 'Earth',
  風: 'Air',
  聖: 'Holy',
  魔: 'Curse',
  喰: 'Eater',
  獣: 'Beast',
  荒: 'Savage',
  機: 'Machina'
}

const openCardDetail = (row: CardRow) => {
  selectedCard.value = {
    card_id: row.id,
    name: row.cardName,
    card_category: 'Unit',
    elements: [elementMap[row.element] ?? 'Fire'],
    level: row.level,
    attack: row.attack,
    defense: row.defense,
    move_type: '歩行',
    races: [row.race],
    spell_slots: ['*'],
    effects: [
      {
        title: 'サンプル能力',
        timing: 'Battle',
        condition: 'モック条件',
        text: `${row.cardName}のダミー効果テキストです。`
      }
    ],
    flavor_text: 'モック表示用のフレーバーテキストです。',
    illustrator: 'ダミー',
    product_name: '悠久のハルシオン',
    rarity: row.rarity,
    reference_label: `${row.setCode}-${row.id.padStart(3, '0')}`
  }
  detailModalOpen.value = true
}

const clearConditions = () => {
  activeConditions.value = []
}
</script>

<template>
  <section>
    <v-sheet
      color="secondary"
      class="d-flex flex-wrap align-center justify-space-between ga-3 pa-3 mb-4"
      border
      rounded
    >
      <div class="d-flex flex-wrap ga-2">
        <v-chip
          v-for="condition in activeConditions"
          :key="condition.id"
          color="accent-light"
          text-color="accent"
          variant="flat"
          size="small"
        >
          {{ condition.label }}
        </v-chip>
      </div>
      <v-btn color="grey-darken-1" variant="flat" size="small" @click="clearConditions">
        条件をクリア
      </v-btn>
    </v-sheet>

    <p class="text-subtitle-1 font-weight-bold mb-2" style="color: #3E2723;">
      検索結果 {{ cardRows.length }}件
    </p>

    <v-card variant="outlined">
      <v-data-table
        :headers="headers"
        :items="cardRows"
        item-value="id"
        fixed-header
        height="620"
        density="comfortable"
        hide-default-footer
        items-per-page="-1"
        class="cards-table"
      >
        <template #item="{ item }">
          <tr
            class="cards-table__row"
            :class="{ 'cards-table__row--zebra': item.zebra }"
            @click="openCardDetail(item)"
          >
            <td class="px-2 py-2">{{ item.setCode }}</td>
            <td class="px-2 py-2">
              <span class="text-accent">{{ item.cardName }}</span>
            </td>
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

    <CardDetailModal
      v-if="selectedCard"
      v-model="detailModalOpen"
      :card="selectedCard"
    />
  </section>
</template>

<style scoped>
.cards-table :deep(thead th) {
  position: sticky;
  top: 0;
  z-index: 2;
  background: rgb(var(--v-theme-primary));
  color: #ffffff;
  font-weight: 700;
}

.cards-table :deep(tbody tr td) {
  border-bottom: 1px solid #eef3e4;
}

.cards-table__row--zebra td {
  background: #f8fbf1;
}

.cards-table__row:hover td {
  background: #eef7e3;
}

.cards-table__row {
  cursor: pointer;
}
</style>
