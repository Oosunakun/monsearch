import type { RulingType } from '~~/app/types/ui/rules'

export const RULING_TYPE_META: Record<
  RulingType,
  {
    shortLabel: string
    label: string
    color: string
  }
> = {
  text_individual: {
    shortLabel: 'カード別',
    label: 'カード別注意点',
    color: 'info',
  },
  text_change: {
    shortLabel: '概要',
    label: '変更点概要',
    color: 'warning',
  },
  errata: {
    shortLabel: 'エラッタ',
    label: 'エラッタ',
    color: 'error',
  },
}