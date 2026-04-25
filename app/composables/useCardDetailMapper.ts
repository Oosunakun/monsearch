import type { CardDetail, ElementCode } from '~~/types/card'
import type { CardListRow } from '~~/app/types/ui/cards'

const elementMap: Record<string, ElementCode> = {
  火: 'Fire',
  水: 'Water',
  土: 'Earth',
  風: 'Air',
  聖: 'Holy',
  魔: 'Curse',
  喰: 'Eater',
  獣: 'Beast',
  荒: 'Savage',
  機: 'Machina'
}

export const useCardDetailMapper = () => {
  const mapCardRowToDetail = (row: CardListRow): CardDetail => ({
    card_id: row.id,
    name: row.cardName,
    card_category: 'Unit',
    elements: [elementMap[row.element] ?? 'Fire'],
    level: row.level,
    attack: row.attack,
    defense: row.defense,
    move_type: '歩行',
    races: [row.race],
    spell_slots: ['*'],
    effects: [
      {
        title: 'サンプル能力',
        timing: 'Battle',
        condition: 'モック条件',
        text: `${row.cardName}のダミー効果テキストです。`
      }
    ],
    flavor_text: 'モック表示用のフレーバーテキストです。',
    illustrator: 'ダミー',
    product_name: '悠久のハルシオン',
    rarity: row.rarity,
    reference_label: `${row.setCode}-${row.id.padStart(3, '0')}`
  })

  return {
    mapCardRowToDetail
  }
}
