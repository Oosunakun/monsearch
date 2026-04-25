import type {
  ElementOption,
  SearchResultHeader,
  SearchResultSource,
  SelectOption
} from '~~/app/types/ui/search'

export const mockSearchCategoryOptions: SelectOption[] = [
  { title: 'ユニット', value: 'unit' },
  { title: 'スペル', value: 'spell' },
  { title: '地形', value: 'terrain' }
]

export const mockSearchRarityOptions: SelectOption[] = [
  { title: 'Sレア', value: 'S' },
  { title: 'R', value: 'R' },
  { title: 'UC', value: 'UC' },
  { title: 'C', value: 'C' }
]

export const mockSearchCardPoolOptions: SelectOption[] = [
  { title: 'オープン', value: 'open' },
  { title: 'ネオスタン', value: 'neo-stand' }
]

export const mockSearchSetOptions: SelectOption[] = [
  { title: '6D 悠久のハルシオン', value: '6D' },
  { title: '6C アゾールの黒い旋風', value: '6C' },
  { title: '6B 紅河の戦慄', value: '6B' }
]

export const mockSearchMoveTypeOptions: SelectOption[] = [
  { title: '飛行', value: 'flying' },
  { title: '歩行', value: 'walk' }
]

export const mockSearchElementOptions: ElementOption[] = [
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

export const mockSearchResultHeaders: SearchResultHeader[] = [
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

export const mockCardSearchResultSourceRows: SearchResultSource[] = [
  { id: '1', setCode: '6D', cardName: '蒼穹の古龍', category: 'ユニット', race: 'ドラゴン', element: '火', level: 6, attack: 7, defense: 6, rarity: 'S' },
  { id: '2', setCode: '6D', cardName: '烈風のドレイク', category: 'ユニット', race: 'ドラゴン', element: '風', level: 5, attack: 6, defense: 4, rarity: 'R' },
  { id: '3', setCode: '6C', cardName: '黒曜のギガンテス', category: 'ユニット', race: 'ジャイアント', element: '土', level: 4, attack: 5, defense: 6, rarity: 'UC' },
  { id: '4', setCode: '5D', cardName: '聖盾のパラディン', category: 'ユニット', race: 'ヒューマン', element: '聖', level: 5, attack: 4, defense: 6, rarity: 'UC' },
  { id: '5', setCode: '4B', cardName: '焔刃のサラマンダー', category: 'ユニット', race: 'サラマンダー', element: '火', level: 4, attack: 5, defense: 3, rarity: 'R' }
]
