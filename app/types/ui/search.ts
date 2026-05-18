import type { 
  Block, 
  CardType, 
  EffectActivationCategory, 
  EffectActivationType, 
  EffectType, 
  Element, 
  Faction, 
  Illustrator, 
  LandCategory, 
  MoveType, 
  Product, 
  Race, 
  Rarity, 
  Resistance 
} from '~~/app/utils/constants/search/options'
import type { SearchOperator, SearchFilter, LogicalMatch } from '~~/app/utils/constants/search/conditions'
import type { CardCategory } from '~~/types/card'

export type NumericCondition = {
  value: number | null
  operator: SearchOperator
}
export type FilteredNumericCondition = {
  filterType: SearchFilter
  value: number | null
  operator: SearchOperator
}
export type SlotCondition = {
  slots: Record<string, number>
  match: LogicalMatch
}

//--------------------------------------------------
// SearchForm
export type SearchForm = {
  // --------------------
  // 基本情報
  // --------------------
  name: string
  cardCategory: CardCategory | ''
  elements: Element[]
  cardTypes: CardType[]
  keyword: string

  // --------------------
  // カードセット・所属
  // --------------------
  products: Product[]
  factions: Faction[]
  blocks: Block[]

  // --------------------
  // ユニット
  // --------------------
  level: FilteredNumericCondition
  heroPoint: FilteredNumericCondition
  attack: NumericCondition
  defence: NumericCondition
  moveTypes: MoveType[]
  races: Race[]
  abilityItemSlots: SlotCondition
  abilitySpellSlots: SlotCondition
  initiative: NumericCondition
  charge: FilteredNumericCondition
  defender: FilteredNumericCondition
  resistances: Resistance[]

  // --------------------
  // 装備品
  // --------------------
  additionalAttack: NumericCondition
  additionalDefence: NumericCondition
  additionalAbilityItemSlots: SlotCondition
  additionalAbilitySpellSlots: SlotCondition
  additionalInitiative: NumericCondition
  additionalCharge: FilteredNumericCondition
  additionalDefender: FilteredNumericCondition
  additionalResistances: Resistance[]

  // --------------------
  // 地形
  // --------------------
  limit: NumericCondition
  landCategory: LandCategory

  // --------------------
  // 特殊能力・カード効果
  // --------------------
  costItemSlots: SlotCondition
  costSpellSlots: SlotCondition
  costOtherEntities: SlotCondition
  effectTypes: EffectType[]
  effectActivationTypes: EffectActivationType[]
  effectActivationCategories: EffectActivationCategory[]
  effectText: string

  // --------------------
  // その他
  // --------------------
  rarities: Rarity[]
  illustrators: Illustrator[]
  referenceLabel: string
}
