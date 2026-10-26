export type ClientSearchQuery = Record<string, string | Array<string | null> | null | undefined>

// $fetchのquery送信→H3解析後と同じ値に揃える。URLの再decodeはしない。
// scalar nullは空値、配列内nullはJSON文字列、undefinedは未送信になる。
export const normalizeClientSearchQuery = (query: ClientSearchQuery): Record<string, string | string[]> =>
  Object.fromEntries(Object.entries(query).flatMap<[string, string | string[]]>(([key, value]) => {
    if (!key || key === '__proto__' || key === 'constructor' || value === undefined) return []
    if (Array.isArray(value)) {
      const values = value.map(item => item === null ? 'null' : item)
      return values.length ? [[key, values.length === 1 ? values[0]! : values]] : []
    }
    return [[key, value ?? '']]
  }))
