export type SearchOption = {
  label: string
  value: string
  color?: string
}

export type NumericOption = {
  value: number
  label: string

  gapAfter?: boolean
  lineBreakAfter?: boolean

  colorPreset?: 'red' | 'blue'
  isThreshold?: boolean
}
