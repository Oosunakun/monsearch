import type { SearchOption } from '~~/app/types/ui/searchOption'

export const productOptions: SearchOption[] = [
  { value: '22d7e', label: '共通商品', color: '#fff' },
  { value: 'ce193', label: '同名商品', color: '#fff' },
  { value: '9f77f', label: '同名商品', color: '#fff' },
]
export const productValues = new Set(productOptions.map(option => option.value))
export const productRow = (id: string, searchValue: string) => ({ id, searchValue, shortName: '', productName: '同名商品', productNote: '', releaseDate: '', zebra: false })
export const homeRows = [productRow('common', '22d7e'), productRow('home', 'ce193')]
export const restrictionRows = [productRow('common', '22d7e'), productRow('restriction', '9f77f')]
export const invalidRow = productRow('invalid', 'unknown')
