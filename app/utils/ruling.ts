import type { CardRulingItem, RulingType } from '~~/app/types/ui/rules'
import { RULING_TYPE_META } from '~~/app/utils/constants/ruling'

export const getRulingTypeLabel = (
  type: RulingType,
  mobile: boolean,
) => {
  return mobile
    ? RULING_TYPE_META[type].shortLabel
    : RULING_TYPE_META[type].label
}

export const getRulingTypeColor = (type: RulingType) => {
  return RULING_TYPE_META[type].color
}

export const normalizeText = (text?: string) => {
  return text?.replace(/\\n/g, '\n') ?? ''
}

export const getRulingSearchText = (item: CardRulingItem) => {
  const baseTexts = [
    item.source_name,
    ...(item.cards?.flatMap(card => [
      card.name,
      card.card_id ?? '',
    ]) ?? []),
  ]

  switch (item.type) {
    case 'text_individual':
      return [
        ...baseTexts,
        item.notice,
        item.change_text,
      ]

    case 'text_change':
      return [
        ...baseTexts,
        item.category ?? '',
        item.subCategory ?? '',
        item.change_text,
      ]

    case 'errata':
      return [
        ...baseTexts,
        item.errata_text,
        item.revision_reason,
      ]
  }
}