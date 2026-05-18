import type {
  ElementOption,
  SearchResultHeader,
  SearchResultSource,
  SelectOption
} from '~/types/ui/_search'

export const mockSearchCategoryOptions: SelectOption[] = [
  { title: 'ユニット', value: 'Unit' },
  { title: '戦闘スペル', value: 'Spell' },
  { title: 'アイテム', value: 'Item' },
  { title: '儀式スペル', value: 'Ritual' },
  { title: '地形', value: 'Land' },
  { title: '召喚術師', value: 'Summoner' },
  { title: 'その他', value: 'Token' }
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
  { label: '火', value: 'Fire', color: 'red' },
  { label: '水', value: 'Water', color: 'blue' },
  { label: '土', value: 'Earth', color: 'light-green' },
  { label: '風', value: 'Air', color: 'green' },
  { label: '聖', value: 'Holy', color: 'amber' },
  { label: '魔', value: 'Curse', color: 'purple' },
  { label: '喰', value: 'Eater', color: 'brown' },
  { label: '獣', value: 'Beast', color: 'deep-orange' },
  { label: '荒', value: 'Savage', color: 'blue-grey' },
  { label: '機', value: 'Machina', color: 'cyan' }
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
  { id: 'unit-001', setCode: '6D', cardName: '蒼穹の古龍', category: 'Unit', race: 'ドラゴン', element: '火/風', level: 6, attack: 7, defense: 6, rarity: 'S' },
  { id: 'spell-001', setCode: '6D', cardName: 'フレイム・ストライク', category: 'Spell', type: 'ダメージ', element: '火', rarity: 'R' },
  { id: 'item-001', setCode: '6C', cardName: '剛力の戦斧', category: 'Item', itemCategory: '武器', race: 'ウォリアー', attack: 3, defense: 1, rarity: 'UC' },
  { id: 'ritual-001', setCode: '6C', cardName: '契約召喚の儀', category: 'Ritual', type: '儀式', rarity: 'R' },
  { id: 'land-001', setCode: '6B', cardName: '業火の山脈', category: 'Land', landCategory: '火山', level: 6, rarity: 'C' },
  { id: 'summoner-001', setCode: '6B', cardName: '赤焔の召喚術師アレク', category: 'Summoner', type: '召喚術師', rarity: 'S' },
  { id: 'token-001', setCode: 'TK', cardName: '炎の使い魔トークン', category: 'Token', race: '使い魔', element: '火', level: 2, attack: 2, defense: 2, rarity: 'Token' }
]
