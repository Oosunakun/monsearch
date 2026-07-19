export type CardCategoryCode =
  | 'Unit'
  | 'Spell'
  | 'Item'
  | 'Land'
  | 'Ritual'
  | 'Summoner'
  | 'Token'

export type ElementCode =
  | 'Fire'
  | 'Water'
  | 'Earth'
  | 'Air'
  | 'Holy'
  | 'Curse'
  | 'Eater'
  | 'Beast'
  | 'Savage'
  | 'Machina'

// export type EffectTiming = 'Battle' | 'Field' | 'Deck' | 'Passive' | 'Other'

// export interface CardEffect {
//   category: string
//   timing?: EffectTiming | string
//   text: string
// }

// export interface Errata {
//   post_date: string
//   effective_date: string
//   errata_text: string
//   revision_reason: string
// }

// export interface FAQ {
//   post_date: string
//   question: string
//   answer: string
// }

// export interface BaseCard {
//   id: string
//   name: string
//   card_category: CardCategoryCode
//   rarity: string
//   element: ElementCode[]
//   type?: string[]
//   product_note: string
//   product_name?: string
//   block?: string
//   faction?: string
//   illustrator?: string
//   reference_label?: string
//   level?: number
//   attack?: number
//   defense?: number
//   move_type?: string
//   race?: string[]
//   item_category?: string
//   land_category?: string
//   effects: CardEffect[]
//   specific?: {
//     banilla?: boolean
//     [key: string]: string | number | boolean | undefined
//   }
//   errata?: Errata[]
//   faq?: FAQ[]
// }

// export interface UnitCard extends BaseCard {
//   card_category: 'Unit'
//   level?: number
//   attack?: number
//   defense?: number
//   move_type?: string
//   initiative?: number
//   charge?: number
//   defender?: number
//   affinity?: string[]
//   ability_slot_item?: number
//   ability_slot_spell?: number
//   hero_point?: number
//   is_instant_summon?: boolean
//   race?: string[]
// }

// export interface SpellCard extends BaseCard {
//   card_category: 'Spell'
//   spell_type?: string
//   frequency?: string
// }

// export interface ItemCard extends BaseCard {
//   card_category: 'Item'
//   item_category?: string
//   attack?: number
//   defense?: number
//   race?: string[]
//   initiative?: number
//   charge?: number
//   defender?: number
//   affinity?: string[]
//   ability_slot_item?: number
//   ability_slot_spell?: number
// }

// export interface RitualCard extends BaseCard {
//   card_category: 'Ritual'
//   ritual_target?: string
//   ritual_cost?: string
// }

// export interface LandCard extends BaseCard {
//   card_category: 'Land'
//   limit?: number
//   land_category?: string
// }

// export interface SummonerCard extends BaseCard {
//   card_category: 'Summoner'
//   summoner_class?: string
//   starting_hand?: number
// }

// export interface TokenCard extends BaseCard {
//   card_category: 'Token'
//   token_for?: CardCategory | 'Any'
//   level?: number
//   attack?: number
//   defense?: number
//   move_type?: string
//   race?: string[]
//   initiative?: number
//   charge?: number
//   defender?: number
//   affinity?: string[]
//   ability_slot_item?: number
//   ability_slot_spell?: number
//   hero_point?: number
//   is_instant_summon?: boolean
//   limit?: number
//   land_category?: string
//   item_category?: string
// }

// export type CardDetail =
//   | UnitCard
//   | SpellCard
//   | ItemCard
//   | RitualCard
//   | LandCard
//   | SummonerCard
//   | TokenCard

// export const isUnitCard = (card: CardDetail): card is UnitCard => card.card_category === 'Unit'
// export const isSpellCard = (card: CardDetail): card is SpellCard => card.card_category === 'Spell'
// export const isItemCard = (card: CardDetail): card is ItemCard => card.card_category === 'Item'
// export const isRitualCard = (card: CardDetail): card is RitualCard => card.card_category === 'Ritual'
// export const isLandCard = (card: CardDetail): card is LandCard => card.card_category === 'Land'
// export const isSummonerCard = (card: CardDetail): card is SummonerCard => card.card_category === 'Summoner'
// export const isTokenCard = (card: CardDetail): card is TokenCard => card.card_category === 'Token'

// export interface LegacyCardDetail {
//   card_id: string
//   elements: ElementCode[]
//   effects: CardEffect[]
//   level?: number
//   attack?: number
//   defense?: number
//   move_type?: string
//   races?: string[]
//   spell_slots?: string[]
// }
