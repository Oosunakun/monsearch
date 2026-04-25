import type { CardCategory, EffectTiming, ElementCode } from '~~/types/card'

export const CARD_CATEGORY_COLORS: Record<CardCategory, string> = {
  Unit: '#5E748A',
  Spell: '#4F8A56',
  Item: '#6D4C41',
  Land: '#A37A1E',
  Ritual: '#8E24AA',
  Summoner: '#8E24AA',
  Token: '#546E7A'
}

export const CARD_ELEMENT_COLORS: Record<ElementCode, string> = {
  Fire: '#E53935',
  Water: '#1E88E5',
  Earth: '#7CB342',
  Air: '#43A047',
  Holy: '#FBC02D',
  Curse: '#8E24AA',
  Eater: '#6D4C41',
  Beast: '#EF6C00',
  Savage: '#546E7A',
  Machina: '#00ACC1'
}

export const CARD_EFFECT_TIMING_COLORS: Record<EffectTiming, string> = {
  Battle: 'red',
  Field: 'blue',
  Deck: 'amber',
  Passive: 'teal',
  Other: 'grey'
}

export const UI_COLORS = {
  headingBrown: '#3E2723',
  tableBorder: '#eef3e4',
  tableZebra: '#f8fbf1',
  tableHover: '#eef7e3'
} as const
