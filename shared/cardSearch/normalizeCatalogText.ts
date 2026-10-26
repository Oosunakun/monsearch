// catalogの検索語専用N₀。Effectのカナ合成を含む正規化とは独立させる。
const HALF_WIDTH_KANA: readonly string[] = [
  '。', '「', '」', '、', '・', 'ヲ', 'ァ', 'ィ', 'ゥ', 'ェ', 'ォ', 'ャ', 'ュ', 'ョ', 'ッ', 'ー',
  'ア', 'イ', 'ウ', 'エ', 'オ', 'カ', 'キ', 'ク', 'ケ', 'コ', 'サ', 'シ', 'ス', 'セ', 'ソ',
  'タ', 'チ', 'ツ', 'テ', 'ト', 'ナ', 'ニ', 'ヌ', 'ネ', 'ノ', 'ハ', 'ヒ', 'フ', 'ヘ', 'ホ',
  'マ', 'ミ', 'ム', 'メ', 'モ', 'ヤ', 'ユ', 'ヨ', 'ラ', 'リ', 'ル', 'レ', 'ロ', 'ワ', 'ン', '\u3099', '\u309a',
]
const OTHER_WIDTH: Readonly<Record<number, string>> = {
  0xffe0: '¢', 0xffe1: '£', 0xffe2: '¬', 0xffe3: '¯', 0xffe4: '¦', 0xffe5: '¥', 0xffe6: '₩',
  0xffe8: '│', 0xffe9: '←', 0xffea: '↑', 0xffeb: '→', 0xffec: '↓', 0xffed: '■', 0xffee: '○',
}

/** 限定幅変換後、ASCII A〜Zだけを小文字化する。合成・trim・空白圧縮はしない。 */
export const normalizeCatalogText = (value: string): string => Array.from(value, character => {
  const point = character.codePointAt(0)!
  const converted = point === 0x3000 ? ' '
    : point >= 0xff01 && point <= 0xff5e ? String.fromCodePoint(point - 0xfee0)
      : point >= 0xff61 && point <= 0xff9f ? HALF_WIDTH_KANA[point - 0xff61]!
        : OTHER_WIDTH[point] ?? character
  const convertedPoint = converted.codePointAt(0)!
  return convertedPoint >= 0x41 && convertedPoint <= 0x5a
    ? String.fromCodePoint(convertedPoint + 0x20) : converted
}).join('')
