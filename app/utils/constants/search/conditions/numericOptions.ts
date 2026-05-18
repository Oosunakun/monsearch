import type { NumericOption } from '~~/app/types/ui/searchOption'

export const createNumericOptions = (
  min: number,
  max: number,
): NumericOption[] => {
  return Array.from(
    { length: max - min + 1 },
    (_, i) => ({
      value: min + i,
      label: String(min + i),
    }),
  )
}