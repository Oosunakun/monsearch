import { UI_COLORS } from '~~/app/utils/constants/colors'
import finderRestrictionFile from '~~/app/utils/mockData/items/rule_restriction.json'

export const mockRestrictionNoticeItems = [
  {
    id: 'description1',
    text: '本サイトの掲載内容は公式資料に基づく非公式の参照情報です。'
  },
  {
    id: 'description2',
    text: '全日本選手権 2026 向け情報を含みます。正確な内容は必ず公式情報をご確認ください。'
  }
]

export const mockRestrictionAvailableProductHeaders = [
  { title: 'カードセット名', key: 'productName', sortable: false },
  { title: '備考', key: 'productNote', sortable: false },
  { title: '発売日', key: 'releaseDate', sortable: false },
  { title: '', key: 'spacer', sortable: false }
]
export const mockRestrictionAvailableProductSources = [
  { id: '20a', searchValue: '22d7e', shortName: 'M20A', productName: '太陽の金の竜姫', productNote: '20th', releaseDate: '2017-03-30' },
  { id: '20b', searchValue: 'cc8cc', shortName: 'M20B', productName: '月の銀の魔狼', productNote: '20th', releaseDate: '2017-03-30' },
  { id: '20c', searchValue: 'ce193', shortName: 'M20C', productName: '召喚士', productNote: 'スペシャルサプライセット', releaseDate: '2017-06-16' },
  { id: '20d', searchValue: '9f77f', shortName: 'M20D', productName: '竜騎士', productNote: 'スペシャルサプライセット', releaseDate: '2017-06-16' },
  { id: '20e', searchValue: '192ad', shortName: 'M20E', productName: 'モンスター・コレクションDeus', productNote: 'モンコレD', releaseDate: '2019-05-17' },
  { id: '20f', searchValue: '4e5f5', shortName: 'M20F', productName: '双星のシャンバラ', productNote: 'モンコレD', releaseDate: '2020-03-13' }
]

export const mockRestrictionCardHeaders = [
  { title: '制限', key: 'restrictionStatus', sortable: false },
  { title: 'カード名', key: 'name', sortable: false },
  { title: '', key: 'restrictionNote', sortable: false },
  { title: '', key: 'spacer', sortable: false }
]
export interface FinderRestriction {
  id: string,
  referenceLabel: string,
  restrictionStatus: string,
  name: string,
  productName: string,
  cardCategoryName: string,
  restrictionNote: string,
}
export const mockRestrictionCardSources: FinderRestriction[] = finderRestrictionFile as unknown as FinderRestriction[]

export const mockRestrictionRelationHeaders = [
  { title: '制限', key: 'restrictionStatus', sortable: false },
  { title: 'カード名', key: 'name', sortable: false },
  { title: '', key: 'spacer', sortable: false }
]

export const mockRestrictionRelationSources = [
  {
    sectionTitle: '《ドゥーガ》と紐づくカード',
    sectionNote:  '次のカードは、召喚術師カードとして《ドゥーガ》を採用している場合にだけ採用可能です。',
    sectionNoteColor: UI_COLORS.WHITE,
    rows: [
      { id: 'M20E-049', referenceLabel: 'M20E-049', restrictionStatus: '1枚制限', name: 'ウォークライ', productName: 'モンスター・コレクションDeus', cardCategoryName: '戦闘スペル', restrictionNote: '' },
      { id: 'M20E-067', referenceLabel: 'M20E-067', restrictionStatus: '1枚制限', name: 'メテオ・ストライク', productName: 'モンスター・コレクションDeus', cardCategoryName: '儀式スペル', restrictionNote: '' },
    ]
  },
  {
    sectionTitle: '《ラプラース》と紐づくカード',
    sectionNote:  '《ラプラース》と、それに紐づく次のカードは、使用禁止です。',
    sectionNoteColor: UI_COLORS.WHITE,
    rows: [
      { id: 'M20E-054', referenceLabel: 'M20E-054', restrictionStatus: '禁止', name: 'フォッグ', productName: 'モンスター・コレクションDeus', cardCategoryName: '戦闘スペル', restrictionNote: '' },
      { id: 'M20E-068', referenceLabel: 'M20E-068', restrictionStatus: '禁止', name: 'ムーンライト・チャージャー', productName: 'モンスター・コレクションDeus', cardCategoryName: '儀式スペル', restrictionNote: '' },
    ]
  },
  {
    sectionTitle: '《アラシャ》と紐づくカード',
    sectionNote:  '次のカードは、召喚術師カードとして《アラシャ》を採用している場合にだけ採用可能です。',
    sectionNoteColor: UI_COLORS.WHITE,
    rows: [
      { id: 'M20E-055', referenceLabel: 'M20E-055', restrictionStatus: '1枚制限', name: 'スリープ', productName: 'モンスター・コレクションDeus', cardCategoryName: '戦闘スペル', restrictionNote: '' },
      { id: 'M20E-069', referenceLabel: 'M20E-069', restrictionStatus: '1枚制限', name: 'アースクエイク', productName: 'モンスター・コレクションDeus', cardCategoryName: '儀式スペル', restrictionNote: '' },
    ]
  },
  {
    sectionTitle: '《ガゼル》と紐づくカード',
    sectionNote:  '次のカードは、召喚術師カードとして《ガゼル》を採用している場合にだけ採用可能です。',
    sectionNoteColor: UI_COLORS.WHITE,
    rows: [
      { id: 'M20E-058', referenceLabel: 'M20E-058', restrictionStatus: '1枚制限', name: 'サイレンス', productName: 'モンスター・コレクションDeus', cardCategoryName: '戦闘スペル', restrictionNote: '' },
      { id: 'M20E-070', referenceLabel: 'M20E-070', restrictionStatus: '1枚制限', name: 'ファーマシー', productName: 'モンスター・コレクションDeus', cardCategoryName: '儀式スペル', restrictionNote: '' },
    ]
  },
  {
    sectionTitle: '《ロゼッタ》と紐づくカード',
    sectionNote:  '次のカードは、召喚術師カードとして《ロゼッタ》を採用している場合にだけ採用可能です。',
    sectionNoteColor: UI_COLORS.WHITE,
    rows: [
      { id: 'M20E-061', referenceLabel: 'M20E-061', restrictionStatus: '1枚制限', name: 'サンクチュアリ', productName: 'モンスター・コレクションDeus', cardCategoryName: '戦闘スペル', restrictionNote: '' },
      { id: 'M20E-071', referenceLabel: 'M20E-071', restrictionStatus: '1枚制限', name: 'コロッサス・ブラッド', productName: 'モンスター・コレクションDeus', cardCategoryName: '儀式スペル', restrictionNote: '' },
    ]
  },
  {
    sectionTitle: '《ストレイン》と紐づくカード',
    sectionNote:  '次のカードは、召喚術師カードとして《ストレイン》を採用している場合にだけ採用可能です。',
    sectionNoteColor: UI_COLORS.WHITE,
    rows: [
      { id: 'M20E-065', referenceLabel: 'M20E-065', restrictionStatus: '1枚制限', name: 'ブラックホール', productName: 'モンスター・コレクションDeus', cardCategoryName: '戦闘スペル', restrictionNote: '' },
      { id: 'M20E-072', referenceLabel: 'M20E-072', restrictionStatus: '1枚制限', name: 'デーモン・トレード', productName: 'モンスター・コレクションDeus', cardCategoryName: '儀式スペル', restrictionNote: '' },
      { id: 'M20E-073', referenceLabel: 'M20E-073', restrictionStatus: '2枚制限', name: 'スペクター', productName: 'モンスター・コレクションDeus', cardCategoryName: 'トークン', restrictionNote: '' },
    ]
  },
  {
    sectionTitle: '《ウズメ》と紐づくカード',
    sectionNote:  '次のカードは、召喚術師カードとして《ウズメ》を採用している場合にだけ採用可能です。',
    sectionNoteColor: UI_COLORS.WHITE,
    rows: [
      { id: 'M20F-010', referenceLabel: 'M20F-010', restrictionStatus: '1枚制限', name: '鬼神法「覇」', productName: '双星のシャンバラ', cardCategoryName: '戦闘スペル', restrictionNote: '' },
      { id: 'M20F-012', referenceLabel: 'M20F-012', restrictionStatus: '1枚制限', name: '雷神掌', productName: '双星のシャンバラ', cardCategoryName: '儀式スペル', restrictionNote: '' },
      { id: 'M20F-013', referenceLabel: 'M20F-013', restrictionStatus: '1枚制限', name: '大雷の鬼姫ミヒカリ', productName: '双星のシャンバラ', cardCategoryName: 'トークン', restrictionNote: '' },
      { id: 'M20F-014', referenceLabel: 'M20F-014', restrictionStatus: '1枚制限', name: '火雷の鬼姫ククリ', productName: '双星のシャンバラ', cardCategoryName: 'トークン', restrictionNote: '' },
    ]
  },
  {
    sectionTitle: '《リブ＆ラブ》と紐づくカード',
    sectionNote:  '次のカードは、召喚術師カードとして《リブ＆ラブ》を採用している場合にだけ採用可能です。',
    sectionNoteColor: UI_COLORS.WHITE,
    rows: [
      { id: 'M20F-025', referenceLabel: 'M20F-025', restrictionStatus: '1枚制限', name: 'ゼロ・フィールド', productName: '双星のシャンバラ', cardCategoryName: '戦闘スペル', restrictionNote: '' },
      { id: 'M20F-026', referenceLabel: 'M20F-026', restrictionStatus: '1枚制限', name: 'コメット', productName: '双星のシャンバラ', cardCategoryName: '儀式スペル', restrictionNote: '' },
      { id: 'M20F-027', referenceLabel: 'M20F-027', restrictionStatus: '1枚制限', name: '時の扉', productName: '双星のシャンバラ', cardCategoryName: 'トークン', restrictionNote: '' },
    ]
  },
  {
    sectionTitle: '《チェルノ》と紐づくカード',
    sectionNote:  '次のカードは、召喚術師カードとして《チェルノ》を採用している場合にだけ採用可能です。',
    sectionNoteColor: UI_COLORS.WHITE,
    rows: [
      { id: 'M20F-037', referenceLabel: 'M20F-037', restrictionStatus: '1枚制限', name: 'インヴィンシブル', productName: '双星のシャンバラ', cardCategoryName: '戦闘スペル', restrictionNote: '' },
      { id: 'M20F-039', referenceLabel: 'M20F-039', restrictionStatus: '1枚制限', name: 'ジャイアント・フィーバー', productName: '双星のシャンバラ', cardCategoryName: '儀式スペル', restrictionNote: '' },
      { id: 'M20F-040', referenceLabel: 'M20F-040', restrictionStatus: '1枚制限', name: 'アトラス', productName: '双星のシャンバラ', cardCategoryName: 'トークン', restrictionNote: '' },
    ]
  },
  {
    sectionTitle: '《エゼキエル》と紐づくカード',
    sectionNote:  '次のカードは、召喚術師カードとして《エゼキエル》を採用している場合にだけ採用可能です。',
    sectionNoteColor: UI_COLORS.WHITE,
    rows: [
      { id: 'M20F-050', referenceLabel: 'M20F-050', restrictionStatus: '1枚制限', name: 'エンジェル・リング', productName: '双星のシャンバラ', cardCategoryName: '戦闘スペル', restrictionNote: '' },
      { id: 'M20F-053', referenceLabel: 'M20F-053', restrictionStatus: '1枚制限', name: 'セブン', productName: '双星のシャンバラ', cardCategoryName: '儀式スペル', restrictionNote: '' },
      { id: 'M20F-054', referenceLabel: 'M20F-054', restrictionStatus: '1枚制限', name: 'コロナ', productName: '双星のシャンバラ', cardCategoryName: 'トークン', restrictionNote: '' },
      { id: 'M20F-055', referenceLabel: 'M20F-055', restrictionStatus: '1枚制限', name: 'ティンクルスター', productName: '双星のシャンバラ', cardCategoryName: 'トークン', restrictionNote: '' },
    ]
  },
]
