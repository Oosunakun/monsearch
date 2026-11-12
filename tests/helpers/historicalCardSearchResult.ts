import type { CardSearchResultItem, CardSearchResultPage } from '~~/shared/cardSearch/types'

export type HistoricalCardSearchResultItem = Omit<CardSearchResultItem, 'effects'> & {
  effects: Array<Omit<CardSearchResultItem['effects'][number], 'effect_condition_text'>>
}

// 使用条件追加前の独立Oracle・hashとの比較に限り、新項目を除外する。
// 使用条件の保持・表示はprojectCardとItemEffectの独立テストで検証する。
export const withoutEffectConditions = (page: CardSearchResultPage) => ({
  ...page,
  items: page.items.map(card => ({
    ...card,
    effects: card.effects.map(({ effect_condition_text: _condition, ...effect }) => effect),
  })),
})
