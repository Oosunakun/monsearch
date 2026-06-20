import type { Card } from '~~/types/cards/finder_cards'
import { mixWithWhiteHex, withAlphaHex } from '~~/app/utils/hexColor'


// --------------------------------------------------

interface ColorDecoration {
  white?: number
  alpha?: number
}

// --------------------------------------------------

const RARITY_ICON: Record<string, string> = {
  Basic: "mdi-circle",
  Common: "mdi-triangle",
  Uncommon: "mdi-rhombus",
  Rare: "mdi-star",
  SuperRare: "mdi-cards-club",
  Special: "mdi-cards-spade",
  DragonJr: "crescent",
  Promotion: "mdi-heart",
  Summoner: "hexagram",
} as const

const BASE_BACKGROUND_COLORS: Record<string, string> = {
  unit: '#1565C0',
  spell: '#4FC3F7',
  item: '#E64A19',
  land: '#FF9B00',
  ritual: '#7B1FA2',
  summoner: '#F50057',
  token: '#616161',
} as const


const CATEGORY_LABEL_COLORS: Record<string, string> = {
  unit: '#515E9E',
  spell: '#448D9F',
  item: '#D56331',
  land: '#659056',
  ritual: '#60478D',
  summoner: '#C09E6A',
  token: '#9C9289',
} as const

const HEADER_GRADIENT_COLORS: Record<string, string> = {
  unit: '#1565C0',
  spell: '#4FC3F7',
  item: '#E64A19',
  land: '#FF9B00',
  ritual: '#7B1FA2',
  summoner: '#F50057',
  token: '#616161',
} as const


const ELEMENT_ICON_COLORS: Record<string, string> = {
  fire: '#D50000',
  water: '#0942FF',
  earth: '#00A823',
  air: '#8A30FF',
  holy: '#EBB01D',
  curse: '#AF260C',
} as const

const EFFECT_BACKGROUND_ELEMENT_COLORS: Record<string, string> = {
  fire: '#F44336',
  water: '#2196F3',
  earth: '#4CAF50',
  air: '#9C27B0',
  holy: '#FBC02D',
  curse: '#784315',
} as const

const EFFECT_BACKGROUND_CATEGORY_COLORS: Record<string, string> = {
  unit: '#0D47A1',
  spell: '#4FC3F7',
  item: '#FFD180',
  land: '#FFD740',
  ritual: '#80CBC4',
  summoner: '#F48FB1',
  token: '#616161',
} as const

const DEFAULT_COLOR = '#E0E0E0'
const HERO_COLOR = '#FFC600'

const BASE_BACKGROUND_STYLE: ColorDecoration = {
  white: 0.3,
  alpha: 1,
}

const CATEGORY_LABEL_STYLE: ColorDecoration = {
  white: 0.2,
  alpha: 0.85,
}

const HEADER_GRADIENT_FROM_STYLE: ColorDecoration = {
  white: 0.2,
  alpha: 0.85,
}

const HEADER_GRADIENT_TO_STYLE: ColorDecoration = {
  white: 0.2,
  alpha: 0.2,
}
const ELEMENT_ICON_STYLE: ColorDecoration = {
  white: 0.4,
  alpha: 1,
}

const EFFECT_BACKGROUND_STYLE: ColorDecoration = {
  white: 0.85,
  alpha: 1,
}

// --------------------------------------------------

function getCategoryCode(card: Card) {
  return card.card_category_code?.toLowerCase() ?? ''
}

function isHero(card: Card) {
  return getCategoryCode(card) === 'unit' && card.unit?.is_hero
}

function getHeroCategoryColor(
  card: Card,
  colors: Record<string, string>,
): string {
  if (isHero(card)) {
    return HERO_COLOR
  }
  return getCategoryColor(card, colors)
}

function getCategoryColor(
  card: Card,
  colors: Record<string, string>,
): string {
  return colors[getCategoryCode(card)] ?? DEFAULT_COLOR
}

function getElementCode(card: Card) {
  const code =
    card.unit?.elements?.[0]?.element_code ??
    card.spell?.elements?.[0]?.element_code
  return code?.toLowerCase() ?? ''
}

function getElementColor(
  code: string,
  colors: Record<string, string>,
): string {
  return colors[code] ?? DEFAULT_COLOR
}

function decorateColor(
  hex: string,
  options?: ColorDecoration,
) {
  let color = hex

  if (options?.white !== undefined) {
    color = mixWithWhiteHex(color, options.white)
  }
  if (options?.alpha !== undefined) {
    color = withAlphaHex(color, options.alpha)
  }

  return color
}

// --------------------------------------------------

export const createCardDesign = (card: Card) => {

  // CardItemMeta.vue
  // 検索窓のロジックに合わせ、レアリティの表示タイプを安全に判定
  // ※カードレアリティのアイコン
  function rarityType() {
    const code = card.rarity_code || ''
    return RARITY_ICON[code] || ''
  }

  // CardSearchResultItem.vue
  // カテゴリに応じたカラーコード（Hex値）を直接解決してCSS変数に渡す
  // ※カード全体の背景色
  function baseBackgroundColor() {
    return decorateColor(
      getHeroCategoryColor(card, BASE_BACKGROUND_COLORS),
      BASE_BACKGROUND_STYLE,
    )
  }

  // CardItemHeaderStat.vue
  // カード分類のアイコンに使用する色
  function categoryLabelColor () {
    return decorateColor(
      getCategoryColor(card, CATEGORY_LABEL_COLORS),
      CATEGORY_LABEL_STYLE,
    )
  }

  // カテゴリに応じたカラーコード（Hex値）を直接解決してCSS変数に渡す
  // カードのヘッダー部分の座布団に使用するグラデーション色
  function headerGradientFrom () {
    return decorateColor(
      getHeroCategoryColor(card, HEADER_GRADIENT_COLORS),
      HEADER_GRADIENT_FROM_STYLE,
    )
  }
  function headerGradientTo () {
    return decorateColor(
      getHeroCategoryColor(card, HEADER_GRADIENT_COLORS),
      HEADER_GRADIENT_TO_STYLE,
    )
  }

  // ユニットまたは戦闘スペルから属性を取得するロジックをここに集約
  // ユニットカードの属性アイコンに使用する色
  // function getElementColor(elementCode: string) {
  function elementIconColor() {
    const elementCode = getElementCode(card)
    return decorateColor(
      getElementColor(elementCode, ELEMENT_ICON_COLORS),
      ELEMENT_ICON_STYLE,
    )
  }

  // CardItemEffect.vue
  // カードの特殊能力欄の座布団に使用する色
  function effectBackgroundColor () {
    // Elements優先
    const elementCode = getElementCode(card)
    if (elementCode) {
      return decorateColor(
        getElementColor(elementCode, EFFECT_BACKGROUND_ELEMENT_COLORS),
        EFFECT_BACKGROUND_STYLE,
      )
    }
  
    // Card Category
    // CATEGORY_EFFECT_COLOR
    return decorateColor(
      getCategoryColor(card, EFFECT_BACKGROUND_CATEGORY_COLORS),
      EFFECT_BACKGROUND_STYLE,
    )
  }

  return {
    rarityType,
    baseBackgroundColor,
    categoryLabelColor,
    headerGradientFrom,
    headerGradientTo,
    elementIconColor,
    effectBackgroundColor,
  }
}