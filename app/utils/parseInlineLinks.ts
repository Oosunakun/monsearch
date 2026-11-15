export type InlineLinkPart =
  | { type: 'text', text: string }
  | { type: 'link', text: string, href: string }

const closingDelimiter = (text: string, start: number, open: string, close: string): number => {
  let depth = 0
  for (let index = start; index < text.length; index++) {
    if (text[index] === open) depth++
    if (text[index] === close && --depth === 0) return index
  }
  return -1
}

const isHttpsLink = (href: string): boolean => {
  if (!/^https:\/\/[^/?#]+(?:[/?#]|$)/i.test(href) || /[\s\\()]/.test(href)
    || [...href].some(character => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127)) return false
  try {
    const url = new URL(href)
    return url.protocol === 'https:' && !url.username && !url.password
  } catch { return false }
}

// [表示名](HTTPS URL)のみを解釈する。ネスト・画像・escape・title等は元のテキストに残す。
export function parseInlineLinks(text: string): InlineLinkPart[] {
  const parts: InlineLinkPart[] = []
  let cursor = 0
  let textStart = 0
  while (cursor < text.length) {
    const start = text.indexOf('[', cursor)
    if (start === -1) break
    const labelEnd = closingDelimiter(text, start, '[', ']')
    if (labelEnd === -1) break
    cursor = labelEnd + 1
    if (text[cursor] !== '(') continue
    const urlEnd = closingDelimiter(text, cursor, '(', ')')
    if (urlEnd === -1) break
    const label = text.slice(start + 1, labelEnd)
    const href = text.slice(cursor + 1, urlEnd)
    cursor = urlEnd + 1
    if (!label || /[[\]\\\r\n]/.test(label) || text[start - 1] === '!' || text[start - 1] === '\\' || !isHttpsLink(href)) continue
    if (start > textStart) parts.push({ type: 'text', text: text.slice(textStart, start) })
    parts.push({ type: 'link', text: label, href })
    textStart = cursor
  }
  if (textStart < text.length || parts.length === 0) parts.push({ type: 'text', text: text.slice(textStart) })
  return parts
}
