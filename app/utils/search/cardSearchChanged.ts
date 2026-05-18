import type { NumericCondition, FilteredNumericCondition, SlotCondition } from '~~/app/types/ui/search'

export const isChangedNumericCondition = (
  current: NumericCondition,
  defaultValue: NumericCondition
): boolean => {
  return (
    current.value !== defaultValue.value ||
    current.operator !== defaultValue.operator
  )
}

export const isChangedFilteredNumericCondition = (
  current: FilteredNumericCondition,
  defaultValue: FilteredNumericCondition
): boolean => {
  return (
    current.filterType !== defaultValue.filterType ||
    current.value !== defaultValue.value ||
    current.operator !== defaultValue.operator
  )
}

export const isChangedSlotCondition = (
  current: SlotCondition,
  defaultValue: SlotCondition
): boolean => {
  if (current.match !== defaultValue.match) return true

  const c = current.slots
  const d = defaultValue.slots

  const cKeys = Object.keys(c)
  const dKeys = Object.keys(d)

  if (cKeys.length !== dKeys.length) return true

  return cKeys.some(key => c[key] !== d[key])
}