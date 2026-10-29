import type { SearchForm } from '~~/app/types/ui/search'
import type { Card } from '~~/types/cards/finderCards'

export const CARD_SEARCH_PER_PAGE = [20, 50, 100] as const
export const CARD_SEARCH_SORT_KEYS = ['id', 'level', 'atk', 'defense', 'initiative', 'rarity'] as const
export const CARD_SEARCH_SORT_ORDERS = ['asc', 'desc'] as const

export type CardSearchPerPage = typeof CARD_SEARCH_PER_PAGE[number]
export type CardSearchSortKey = typeof CARD_SEARCH_SORT_KEYS[number]
export type CardSearchSortOrder = typeof CARD_SEARCH_SORT_ORDERS[number]

export interface CardSearchRequest {
  criteria: SearchForm
  page: number
  perPage: CardSearchPerPage
  sort: CardSearchSortKey
  order: CardSearchSortOrder
}

type DisplayAbility = {
  initiative: number | null
  charge: number | null
  defender: number | null
  ability_slots: Array<Pick<NonNullable<NonNullable<Card['unit']>['ability']>['ability_slots'][number], 'ability_slot_type_name' | 'ability_slot_category_code' | 'slot_count'>>
  affinities: Array<Pick<NonNullable<NonNullable<Card['unit']>['ability']>['affinities'][number], 'affinity' | 'affinity_value'>>
}
type DisplayUnit = Pick<NonNullable<Card['unit']>, 'level' | 'is_instant_summon' | 'is_hero' | 'hero_point' | 'move_type_name' | 'attack' | 'defense' | 'elements' | 'races'> & { ability: DisplayAbility | null }
type DisplaySpell = Pick<NonNullable<Card['spell']>, 'elements'>
type DisplayItem = {
  item_category_name: string
  consume: Record<string, never> | null
  equip: ({ attack: number, defense: number, ability: DisplayAbility | null }) | null
  bullet: Record<string, never> | null
}
type DisplayLand = Pick<NonNullable<Card['land']>, 'land_limit'>
type DisplaySummoner = NonNullable<Card['summoner']>

export interface CardSearchResultItem {
  card_id: string
  reference_label: string
  name: string
  card_category_code: string
  card_category_name: string
  unit: DisplayUnit | null
  spell: DisplaySpell | null
  item: DisplayItem | null
  land: DisplayLand | null
  ritual: Record<string, never> | null
  summoner: DisplaySummoner | null
  card_types: Array<Pick<Card['card_types'][number], 'card_type_id' | 'card_type_name'>>
  blocks: Array<Pick<Card['blocks'][number], 'block_name'>>
  factions: Array<Pick<Card['factions'][number], 'faction_name'>>
  effects: Array<Pick<Card['effects'][number], 'effect_name' | 'effect_type_name' | 'effect_activation_type_name' | 'effect_activation_category_code' | 'effect_activation_timing_name' | 'effect_cost_text' | 'effect_target_name' | 'effect_text'>>
  rarity_code: string
  rarity_name: string
  illustrator_name: string
  product: Pick<Card['product'], 'product_name'>
  deck_restriction_count: number | null
}

export interface CardSearchResultPage {
  items: CardSearchResultItem[]
  totalCount: number
  page: number
  perPage: CardSearchPerPage
  totalPages: number
  sort: { key: CardSearchSortKey, order: CardSearchSortOrder }
  categoryBreakdown: Array<{ categoryCode: string, count: number }>
}

export interface CardSearchFailure {
  statusCode: 500
  code: 'CARD_SEARCH_FAILED'
  message: string
}

export interface SourceCard {
  card: Card
  sourceIndex: number
}
