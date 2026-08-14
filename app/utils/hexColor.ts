interface RgbColor {
  r: number
  g: number
  b: number
}

interface HslColor {
  /** 0～360 */
  h: number
  /** 0～1 */
  s: number
  /** 0～1 */
  l: number
}

/**
 * hue:
 *   色相(°)
 *
 * saturation:
 *   彩度(%)
 *
 * lightness:
 *   明度(%)
 */
export interface HslShift {
  readonly hue: number
  readonly saturation: number
  readonly lightness: number
}

// --------------------------------------------------

/**
 * "#80D36F" → { r, g, b }
 * RGBは0～1で返す
 */
function hexToRgb(hex: string): RgbColor {
  const value = hex.replace('#', '')

  return {
    r: parseInt(value.substring(0, 2), 16) / 255,
    g: parseInt(value.substring(2, 4), 16) / 255,
    b: parseInt(value.substring(4, 6), 16) / 255,
  }
}
/**
 * RGB(0～1) → "#80D36F"
 */
function rgbToHex({ r, g, b }: RgbColor): string {
  const toHex = (c: number) =>
    Math.round(c * 255)
      .toString(16)
      .padStart(2, '0')

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}
/**
 * RGB(0～1) → HSL
 *
 * H: 0～360
 * S,L: 0～1
 */
function rgbToHsl({ r, g, b }: RgbColor): HslColor {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)

  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min

    s =
      l > 0.5
        ? d / (2 - max - min)
        : d / (max + min)

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break

      case g:
        h = (b - r) / d + 2
        break

      case b:
        h = (r - g) / d + 4
        break
    }

    h *= 60
  }

  return {
    h,
    s,
    l,
  }
}
/**
 * HSL → RGB(0～1)
 */
function hslToRgb({
  h,
  s,
  l,
}: HslColor): RgbColor {

  h /= 360

  const hue2rgb = (
    p: number,
    q: number,
    t: number,
  ) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1

    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3)
      return p + (q - p) * (2 / 3 - t) * 6

    return p
  }

  if (s === 0) {
    return {
      r: l,
      g: l,
      b: l,
    }
  }

  const q =
    l < 0.5
      ? l * (1 + s)
      : l + s - l * s

  const p = 2 * l - q

  return {
    r: hue2rgb(p, q, h + 1 / 3),
    g: hue2rgb(p, q, h),
    b: hue2rgb(p, q, h - 1 / 3),
  }
}

// --------------------------------------------------

/**
 * HEXカラーの明度(HSL Lightness)を下げる
 *
 * @param hex "#80d36f"
 * @param percent 0～100（20なら20%暗くする）
 */
export function darkenColor(
  hex: string,
  percent: number,
): string {

  const hsl = rgbToHsl(hexToRgb(hex))

  hsl.l *= (100 - percent) / 100

  return rgbToHex(hslToRgb(hsl))
}

/**
 * HSLの各要素を相対変更する
 *
 * @param hex "#80d36f"
 * @param shift HSLの変化量
 */
export function shiftColor(
  hex: string,
  shift: HslShift,
): string {

  const hsl = rgbToHsl(hexToRgb(hex))

  hsl.h += shift.hue
  hsl.s += shift.saturation / 100
  hsl.l += shift.lightness / 100

  while (hsl.h < 0) hsl.h += 360
  while (hsl.h >= 360) hsl.h -= 360

  hsl.s = Math.max(0, Math.min(1, hsl.s))
  hsl.l = Math.max(0, Math.min(1, hsl.l))

  return rgbToHex(hslToRgb(hsl))
}

export function mixWithWhiteHex(
  hex: string,
  amount: number,
) {
  const rgb = hexToRgb(hex)

  return rgbToHex({
    r: rgb.r + (1 - rgb.r) * amount,
    g: rgb.g + (1 - rgb.g) * amount,
    b: rgb.b + (1 - rgb.b) * amount,
  })
}

export function withAlphaHex(hex: string, alpha: number) {
  const a = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0')
    .toUpperCase()

  return `${hex.slice(0, 7)}${a}`
}
