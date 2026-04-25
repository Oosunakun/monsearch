import type { CardCategory } from '~~/types/card'

export type SearchCondition = {
  id: string
  label: string
}

export type CardListSourceRow = {
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
}

export type CardListRow = CardListSourceRow & {
  zebra: boolean
}

export type CardListHeader = {
  title: string
  key: keyof CardListRow
  sortable: boolean
}

export type CardCategoryNote = {
  title: string
  description: string
}

export const CARD_CATEGORY_NOTES: Partial<Record<CardCategory, CardCategoryNote>> = {
  Token: {
    title: 'トークン専用効果',
    description: '永続効果や生成条件をここに表示します。'
  },
  Summoner: {
    title: '召喚術師情報',
    description: '召喚条件・専用能力・関連カードをここに表示します。'
  },
  Ritual: {
    title: '召喚術師情報',
    description: '召喚条件・専用能力・関連カードをここに表示します。'
  }
}
