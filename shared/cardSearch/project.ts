import type { Card } from '~~/types/cards/finderCards'
import type { CardSearchResultItem } from './types'

export const projectCard = (card: Card): CardSearchResultItem | undefined => {
  if (!card.card_id || !card.reference_label || !card.name || !card.card_category_code || !card.card_category_name || !card.product?.product_name) return
  const ability = (value: NonNullable<NonNullable<Card['unit']>['ability']>) => ({
    initiative: value.initiative, charge: value.charge, defender: value.defender,
    ability_slots: value.ability_slots.map(slot => ({ ability_slot_type_name: slot.ability_slot_type_name, ability_slot_category_code: slot.ability_slot_category_code, slot_count: slot.slot_count })),
    affinities: structuredClone(value.affinities),
  })
  return {
    deck_restriction_count: typeof card.modification?.deck_restriction_count === 'number' ? card.modification.deck_restriction_count : null,
    card_id: card.card_id, reference_label: card.reference_label, name: card.name,
    card_category_code: card.card_category_code, card_category_name: card.card_category_name,
    unit: card.unit ? { level: card.unit.level, is_instant_summon: card.unit.is_instant_summon, is_hero: card.unit.is_hero, hero_point: card.unit.hero_point, move_type_name: card.unit.move_type_name, attack: card.unit.attack, defense: card.unit.defense, elements: structuredClone(card.unit.elements), races: structuredClone(card.unit.races), ability: card.unit.ability ? ability(card.unit.ability) : null } : null,
    spell: card.spell ? { elements: structuredClone(card.spell.elements) } : null,
    item: card.item ? { item_category_name: card.item.item_category_name, consume: card.item.consume ? {} : null, equip: card.item.equip ? { attack: card.item.equip.attack, defense: card.item.equip.defense, ability: card.item.equip.ability ? ability(card.item.equip.ability) : null } : null, bullet: card.item.bullet ? {} : null } : null,
    land: card.land ? { land_limit: card.land.land_limit } : null,
    ritual: card.ritual ? {} : null,
    summoner: card.summoner ? { arcana: card.summoner.arcana, secondary_name: card.summoner.secondary_name } : null,
    card_types: card.card_types.map(value => ({ card_type_id: value.card_type_id, card_type_name: value.card_type_name })),
    blocks: card.blocks.map(value => ({ block_name: value.block_name })),
    factions: card.factions.map(value => ({ faction_name: value.faction_name })),
    effects: card.effects.map(value => ({ effect_name: value.effect_name, effect_type_name: value.effect_type_name, effect_activation_type_name: value.effect_activation_type_name, effect_activation_category_code: value.effect_activation_category_code, effect_activation_timing_name: value.effect_activation_timing_name, effect_cost_text: value.effect_cost_text, effect_target_name: value.effect_target_name, effect_text: value.effect_text })),
    rarity_code: card.rarity_code, rarity_name: card.rarity_name, illustrator_name: card.illustrator_name,
    product: { product_name: card.product.product_name },
  }
}

export const projectCards = (cards: readonly Card[]) => cards.map(projectCard).filter((card): card is CardSearchResultItem => card !== undefined)
