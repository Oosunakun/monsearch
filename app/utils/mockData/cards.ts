import type { CardListHeader, CardListSourceRow, SearchCondition } from '~~/app/types/ui/cards'

export const mockCardListHeaders: CardListHeader[] = [
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

export const mockActiveSearchConditions: SearchCondition[] = [
  { id: 'name', label: 'カード名: ドラゴン' },
  { id: 'pool', label: 'カードプール: オープン' },
  { id: 'element', label: '属性: 火/風' }
]

export const mockCardListSourceRows: CardListSourceRow[] = [
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
