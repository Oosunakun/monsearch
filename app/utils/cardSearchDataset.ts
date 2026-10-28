import type { Card, FinderCards } from '~~/types/cards/finderCards'
import type { SourceCard } from '~~/shared/cardSearch/types'

let dataset: Promise<readonly SourceCard[]> | undefined

const isCard = (value: unknown): value is Card => {
  if (!value || typeof value !== 'object') return false
  const card = value as Partial<Card>
  return typeof card.card_id === 'string' && typeof card.card_category_code === 'string'
    && !!card.search_support && typeof card.search_support.full_text === 'string'
    && typeof card.search_support.archetype_text === 'string'
}

// moduleはdocument内で共有。rawデータをVue state/Nuxt payloadへ入れない。
export const loadCardSearchDataset = (): Promise<readonly SourceCard[]> => {
  if (!dataset) dataset = Promise.resolve().then(async () => {
    try {
      const response = await fetch('/data/cards.json', { cache: 'no-cache' })
      if (!response.ok) throw new Error(`カードデータ取得失敗 (${response.status})`)
      const body: unknown = await response.json()
      const file = body as Partial<FinderCards> | null
      if (!file || typeof file.version !== 'string' || typeof file.generated_at !== 'string'
        || !Array.isArray(file.cards) || !file.cards.every(isCard)) throw new Error('カードデータ形式が不正です')
      return file.cards.map((card, sourceIndex) => ({ card, sourceIndex }))
    } catch (error) {
      dataset = undefined
      throw error
    }
  })
  return dataset
}
