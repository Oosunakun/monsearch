export type CardCategory =
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

export type EffectTiming = 'Battle' | 'Field' | 'Deck' | 'Passive' | 'Other'

export interface CardEffect {
  title: string
  timing: EffectTiming
  condition?: string
  text: string
}

export interface CardDetail {
  card_id: string
  name: string
  card_category: CardCategory
  elements: ElementCode[]
  level?: number
  attack?: number
  defense?: number
  move_type?: string
  races: string[]
  spell_slots: string[]
  effects: CardEffect[]
  flavor_text?: string
  illustrator: string
  product_name: string
  rarity: string
  reference_label: string
}
