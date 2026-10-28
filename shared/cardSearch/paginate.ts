export const paginate = <T>(items: readonly T[], requestedPage: number, perPage: number) => {
  const totalPages = Math.max(1, Math.ceil(items.length / perPage))
  const page = Math.min(Math.max(1, requestedPage), totalPages)
  return { items: items.slice((page - 1) * perPage, page * perPage), page, totalPages }
}
