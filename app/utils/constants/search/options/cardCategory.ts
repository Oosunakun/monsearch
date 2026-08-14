import type { SearchOption } from '~~/app/types/ui/searchOption'

export const CARD_CATEGORY = {
  UNIT: { label: 'ユニット', value: 'unit', color: 'blue-darken-4' },
  SPELL: { label: '戦闘スペル', value: 'spell', color: 'light-blue-lighten-2' },
  ITEM_CONSUME: { label: '消耗品', value: 'item-consume', color: 'yellow-darken-2' },
  ITEM_EQUIP: { label: '装備品', value: 'item-equip', color: 'yellow-darken-2' },
  ITEM_BULLET: { label: '錬金弾', value: 'item-bullet', color: 'yellow-darken-2' },
  LAND:{ label: '地形', value: 'land', color: 'brown-lighten-1' },
  RITUAL: { label: '儀式スペル', value: 'ritual', color: 'purple-darken-1' },
  SUMMONER: { label: '召喚術師', value: 'summoner', color: 'deep-orange-lighten-1' },
  TOKEN: { label: 'トークン', value: 'token', color: 'grey-darken-2' },
} as const
export const CARD_CATEGORY_OPTIONS: SearchOption[] = Object.values(CARD_CATEGORY)
export const CARD_CATEGORY_VALUES = new Set(CARD_CATEGORY_OPTIONS.map(x => x.value))
export type CardCategory = typeof CARD_CATEGORY[keyof typeof CARD_CATEGORY]['value']
