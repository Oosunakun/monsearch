import type { CardListHeader, CardListSourceRow, SearchCondition } from '~~/app/types/ui/cards'
import type { CardDetail } from '~~/types/card'
import finderCardFile from '~~/app/utils/mockData/items/cards.json'
import type { FinderCards } from '~~/types/cards/finder_cards'

export const mockFinderCards: FinderCards = finderCardFile as unknown as FinderCards

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
  { id: 'unit-001', setCode: '6D', cardName: '蒼穹の古龍', category: 'Unit', race: 'ドラゴン', element: '火', level: 6, attack: 7, defense: 6, rarity: 'S' },
  { id: 'spell-001', setCode: '6D', cardName: 'フレイム・ストライク', category: 'Spell', element: '火', rarity: 'R' },
  { id: 'item-001', setCode: '6C', cardName: '剛力の戦斧', category: 'Item', race: 'ウォリアー', attack: 3, rarity: 'UC' },
  { id: 'ritual-001', setCode: '6C', cardName: '契約召喚の儀', category: 'Ritual', rarity: 'R' },
  { id: 'land-001', setCode: '6B', cardName: '業火の山脈', category: 'Land', element: '火', level: 2, rarity: 'C' },
  { id: 'summoner-001', setCode: '6B', cardName: '赤焔の召喚術師アレク', category: 'Summoner', rarity: 'S' },
  { id: 'token-001', setCode: 'TK', cardName: '炎の使い魔トークン', category: 'Token', element: '火', level: 2, attack: 2, defense: 2, rarity: 'Token' }
]

export const mockCardDetails: CardDetail[] = [
  {
    id: 'unit-001',
    name: '蒼穹の古龍',
    card_category: 'Unit',
    rarity: 'S',
    element: ['Fire', 'Air'],
    type: ['ドラゴン'],
    product_note: '6D-001',
    product_name: '悠久のハルシオン',
    reference_label: '6D-001',
    illustrator: 'Nori',
    level: 6,
    attack: 7,
    defense: 6,
    move_type: 'flying',
    initiative: 2,
    charge: 1,
    affinity: ['耐火:2'],
    ability_slot_item: 1,
    ability_slot_spell: 2,
    hero_point: 2,
    is_instant_summon: true,
    race: ['ドラゴン'],
    effects: [{ category: '常時', timing: 'Field', text: 'このユニットは火属性ダメージを1軽減する。' }],
    specific: { banilla: false },
    errata: [
      {
        post_date: '2025-01-10',
        effective_date: '2025-01-17',
        errata_text: '攻撃力を6から7へ修正',
        revision_reason: '誤植修正'
      }
    ],
    faq: [{ post_date: '2025-02-12', question: '即時召喚は可能ですか？', answer: '可能です。' }]
  },
  {
    id: 'spell-001',
    name: 'フレイム・ストライク',
    card_category: 'Spell',
    rarity: 'R',
    element: ['Fire'],
    type: ['戦闘スペル'],
    product_note: '6D-023',
    product_name: '悠久のハルシオン',
    reference_label: '6D-023',
    spell_type: 'ダメージ',
    frequency: '高',
    effects: [{ category: '対抗', timing: 'Battle', text: '敵軍ユニット1体に3ダメージ。' }]
  },
  {
    id: 'item-001',
    name: '剛力の戦斧',
    card_category: 'Item',
    rarity: 'UC',
    element: ['Earth'],
    item_category: '武器',
    type: ['装備品'],
    product_note: '6C-044',
    reference_label: '6C-044',
    attack: 3,
    defense: 1,
    race: ['ウォリアー'],
    ability_slot_item: 1,
    effects: [{ category: '装備', text: '装備中ユニットの攻撃力を+3する。' }]
  },
  {
    id: 'ritual-001',
    name: '契約召喚の儀',
    card_category: 'Ritual',
    rarity: 'R',
    element: ['Holy'],
    type: ['儀式'],
    product_note: '6C-071',
    ritual_target: '英雄ユニット',
    ritual_cost: '手札2枚破棄',
    effects: [{ category: '儀式', timing: 'Deck', text: '山札から英雄ユニットを1枚手札に加える。' }]
  },
  {
    id: 'land-001',
    name: '業火の山脈',
    card_category: 'Land',
    rarity: 'C',
    element: ['Fire'],
    type: ['地形'],
    product_note: '6B-018',
    limit: 6,
    land_category: '火山',
    effects: [{ category: '地形', timing: 'Field', text: '火属性ユニットの攻撃力を+1する。' }]
  },
  {
    id: 'summoner-001',
    name: '赤焔の召喚術師アレク',
    card_category: 'Summoner',
    rarity: 'S',
    element: ['Fire'],
    type: ['召喚術師'],
    product_note: '6B-S01',
    summoner_class: '炎術士',
    starting_hand: 6,
    effects: [{ category: '常在', text: '自軍火属性ユニットの行動完了を1体まで無効化できる。' }]
  },
  {
    id: 'token-001',
    name: '炎の使い魔トークン',
    card_category: 'Token',
    rarity: 'Token',
    element: ['Fire'],
    type: ['トークン'],
    product_note: 'TK-001',
    token_for: 'Any',
    level: 2,
    attack: 2,
    defense: 2,
    move_type: 'walk',
    specific: { banilla: true },
    effects: [{ category: 'なし', text: 'このカードは効果を持たない。' }]
  }
]
