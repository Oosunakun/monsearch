import { UI_COLORS } from '~~/app/utils/constants/colors'

export const mockRestrictionAvailableProductHeaders = [
  { title: 'カードセット名', key: 'productName', sortable: false },
  { title: '備考', key: 'productNote', sortable: false },
  { title: '発売日', key: 'releaseDate', sortable: false },
  { title: '', key: 'spacer', sortable: false }
]
export const mockRestrictionAvailableProductSources = [
  { id: '20a', shortName: 'M20A', productName: '太陽の金の竜姫', productNote: '20th', releaseDate: '2017-03-30' },
  { id: '20b', shortName: 'M20B', productName: '月の銀の魔狼', productNote: '20th', releaseDate: '2017-03-30' },
  { id: '20c', shortName: 'M20C', productName: '召喚士', productNote: 'スペシャルサプライセット', releaseDate: '2017-06-16' },
  { id: '20d', shortName: 'M20D', productName: '竜騎士', productNote: 'スペシャルサプライセット', releaseDate: '2017-06-16' },
  { id: '20e', shortName: 'M20E', productName: 'モンスター・コレクションDeus', productNote: 'モンコレD', releaseDate: '2019-05-17' },
  { id: '20f', shortName: 'M20F', productName: '双星のシャンバラ', productNote: 'モンコレD', releaseDate: '2020-03-13' }
]

export const mockRestrictionCardHeaders = [
  { title: '制限', key: 'restrictionStatus', sortable: false },
  { title: 'カード名', key: 'name', sortable: false },
  { title: '備考', key: 'restrictionNote', sortable: false },
  { title: '', key: 'spacer', sortable: false }
]
export const mockRestrictionCardSources = [
  { id: 'M20E-009', referenceLabel: 'M20E-009', restrictionStatus: '禁止', name: 'スパーク・ヘッジホッグ', productName: 'モンスター・コレクションDeus', cardCategoryName: 'ユニット', restrictionNote: '' },
  { id: 'M20E-002', referenceLabel: 'M20E-002', restrictionStatus: '禁止', name: 'ラプラース', productName: 'モンスター・コレクションDeus', cardCategoryName: '召喚術師', restrictionNote: '' },
  { id: 'M20E-017', referenceLabel: 'M20E-017', restrictionStatus: '禁止', name: 'アクアマリン・ハーミット', productName: 'モンスター・コレクションDeus', cardCategoryName: 'ユニット', restrictionNote: '' },
  { id: 'M20E-054', referenceLabel: 'M20E-054', restrictionStatus: '禁止', name: 'フォッグ', productName: 'モンスター・コレクションDeus', cardCategoryName: '戦闘スペル', restrictionNote: '' },
  { id: 'M20E-068', referenceLabel: 'M20E-068', restrictionStatus: '禁止', name: 'ムーンライト・チャージャー', productName: 'モンスター・コレクションDeus', cardCategoryName: '儀式スペル', restrictionNote: '' },
  { id: 'M20F-017', referenceLabel: 'M20F-017', restrictionStatus: '禁止', name: '虹の雫の精霊', productName: '双星のシャンバラ', cardCategoryName: 'ユニット', restrictionNote: '' },
  { id: 'M20E-067', referenceLabel: 'M20E-067', restrictionStatus: '1枚制限', name: 'メテオ・ストライク', productName: 'モンスター・コレクションDeus', cardCategoryName: '儀式スペル', restrictionNote: '1枚制限カード対象（すべての「儀式スペルカード」）' },
  { id: 'M20E-069', referenceLabel: 'M20E-069', restrictionStatus: '1枚制限', name: 'アースクエイク', productName: 'モンスター・コレクションDeus', cardCategoryName: '儀式スペル', restrictionNote: '1枚制限カード対象（すべての「儀式スペルカード」）' },
  { id: 'M20E-070', referenceLabel: 'M20E-070', restrictionStatus: '1枚制限', name: 'ファーマシー', productName: 'モンスター・コレクションDeus', cardCategoryName: '儀式スペル', restrictionNote: '1枚制限カード対象（すべての「儀式スペルカード」）' },
  { id: 'M20E-071', referenceLabel: 'M20E-071', restrictionStatus: '1枚制限', name: 'コロッサス・ブラッド', productName: 'モンスター・コレクションDeus', cardCategoryName: '儀式スペル', restrictionNote: '1枚制限カード対象（すべての「儀式スペルカード」）' },
  { id: 'M20E-072', referenceLabel: 'M20E-072', restrictionStatus: '1枚制限', name: 'デーモン・トレード', productName: 'モンスター・コレクションDeus', cardCategoryName: '儀式スペル', restrictionNote: '1枚制限カード対象（すべての「儀式スペルカード」）' },
  { id: 'M20F-012', referenceLabel: 'M20F-012', restrictionStatus: '1枚制限', name: '雷神掌', productName: '双星のシャンバラ', cardCategoryName: '儀式スペル', restrictionNote: '1枚制限カード対象（すべての「儀式スペルカード」）' },
  { id: 'M20F-026', referenceLabel: 'M20F-026', restrictionStatus: '1枚制限', name: 'コメット', productName: '双星のシャンバラ', cardCategoryName: '儀式スペル', restrictionNote: '1枚制限カード対象（すべての「儀式スペルカード」）' },
  { id: 'M20F-039', referenceLabel: 'M20F-039', restrictionStatus: '1枚制限', name: 'ジャイアント・フィーバー', productName: '双星のシャンバラ', cardCategoryName: '儀式スペル', restrictionNote: '1枚制限カード対象（すべての「儀式スペルカード」）' },
  { id: 'M20F-053', referenceLabel: 'M20F-053', restrictionStatus: '1枚制限', name: 'セブン', productName: '双星のシャンバラ', cardCategoryName: '儀式スペル', restrictionNote: '1枚制限カード対象（すべての「儀式スペルカード」）' },
  { id: 'M20F-013', referenceLabel: 'M20F-013', restrictionStatus: '1枚制限', name: '大雷の鬼姫ミヒカリ', productName: '双星のシャンバラ', cardCategoryName: 'トークン', restrictionNote: '' },
  { id: 'M20F-014', referenceLabel: 'M20F-014', restrictionStatus: '1枚制限', name: '火雷の鬼姫ククリ', productName: '双星のシャンバラ', cardCategoryName: 'トークン', restrictionNote: '' },
  { id: 'M20F-037', referenceLabel: 'M20F-037', restrictionStatus: '1枚制限', name: 'インヴィンシブル', productName: '双星のシャンバラ', cardCategoryName: '戦闘スペル', restrictionNote: '' },
  { id: 'M20F-040', referenceLabel: 'M20F-040', restrictionStatus: '1枚制限', name: 'アトラス', productName: '双星のシャンバラ', cardCategoryName: 'トークン', restrictionNote: '' },
  { id: 'M20F-054', referenceLabel: 'M20F-054', restrictionStatus: '1枚制限', name: 'コロナ', productName: '双星のシャンバラ', cardCategoryName: 'トークン', restrictionNote: '' },
  { id: 'M20F-055', referenceLabel: 'M20F-055', restrictionStatus: '1枚制限', name: 'ティンクルスター', productName: '双星のシャンバラ', cardCategoryName: 'トークン', restrictionNote: '' },
  { id: 'M20E-073', referenceLabel: 'M20E-073', restrictionStatus: '2枚制限', name: 'スペクター', productName: 'モンスター・コレクションDeus', cardCategoryName: 'トークン', restrictionNote: '' },
  { id: 'M20F-027', referenceLabel: 'M20F-027', restrictionStatus: '2枚制限', name: '時の扉', productName: '双星のシャンバラ', cardCategoryName: 'トークン', restrictionNote: '' },
]

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
      { id: 'M20E-055', referenceLabel: 'M20E-055', restrictionStatus: '', name: 'スリープ', productName: 'モンスター・コレクションDeus', cardCategoryName: '戦闘スペル', restrictionNote: '' },
      { id: 'M20E-067', referenceLabel: 'M20E-067', restrictionStatus: '1枚制限', name: 'アースクエイク', productName: 'モンスター・コレクションDeus', cardCategoryName: '儀式スペル', restrictionNote: '' },
    ]
  },
  {
    sectionTitle: '《ラプラース》と紐づくカード',
    sectionNote:  '《ラプラース》と、それに紐づく次のカードは、使用禁止です。',
    sectionNoteColor: UI_COLORS.WHITE,
    rows: [
      { id: 'M20E-054', referenceLabel: 'M20E-054', restrictionStatus: '禁止', name: 'フォッグ', productName: 'モンスター・コレクションDeus', cardCategoryName: '戦闘スペル', restrictionNote: '' },
      { id: 'M20E-071', referenceLabel: 'M20E-071', restrictionStatus: '禁止', name: 'ムーンライト・チャージャー', productName: 'モンスター・コレクションDeus', cardCategoryName: '儀式スペル', restrictionNote: '' },
    ]
  },
  {
    sectionTitle: '《アラシャ》と紐づくカード',
    sectionNote:  '次のカードは、召喚術師カードとして《アラシャ》を採用している場合にだけ採用可能です。',
    sectionNoteColor: UI_COLORS.WHITE,
    rows: [
      { id: 'M20E-055', referenceLabel: 'M20E-055', restrictionStatus: '', name: 'スリープ', productName: 'モンスター・コレクションDeus', cardCategoryName: '戦闘スペル', restrictionNote: '' },
      { id: 'M20E-067', referenceLabel: 'M20E-067', restrictionStatus: '1枚制限', name: 'アースクエイク', productName: 'モンスター・コレクションDeus', cardCategoryName: '儀式スペル', restrictionNote: '' },
    ]
  },
  {
    sectionTitle: '《ガゼル》と紐づくカード',
    sectionNote:  '次のカードは、召喚術師カードとして《ガゼル》を採用している場合にだけ採用可能です。',
    sectionNoteColor: UI_COLORS.WHITE,
    rows: [
      { id: 'M20E-058', referenceLabel: 'M20E-058', restrictionStatus: '', name: 'サイレンス', productName: 'モンスター・コレクションDeus', cardCategoryName: '戦闘スペル', restrictionNote: '' },
      { id: 'M20E-070', referenceLabel: 'M20E-070', restrictionStatus: '1枚制限', name: 'ファーマシー', productName: 'モンスター・コレクションDeus', cardCategoryName: '儀式スペル', restrictionNote: '' },
    ]
  },
  {
    sectionTitle: '《ロゼッタ》と紐づくカード',
    sectionNote:  '次のカードは、召喚術師カードとして《ロゼッタ》を採用している場合にだけ採用可能です。',
    sectionNoteColor: UI_COLORS.WHITE,
    rows: [
      { id: 'M20E-061', referenceLabel: 'M20E-061', restrictionStatus: '', name: 'サンクチュアリ', productName: 'モンスター・コレクションDeus', cardCategoryName: '戦闘スペル', restrictionNote: '' },
      { id: 'M20E-068', referenceLabel: 'M20E-068', restrictionStatus: '1枚制限', name: 'コロッサス・ブラッド', productName: 'モンスター・コレクションDeus', cardCategoryName: '儀式スペル', restrictionNote: '' },
    ]
  },
  {
    sectionTitle: '《ストレイン》と紐づくカード',
    sectionNote:  '次のカードは、召喚術師カードとして《ストレイン》を採用している場合にだけ採用可能です。',
    sectionNoteColor: UI_COLORS.WHITE,
    rows: [
      { id: 'M20E-065', referenceLabel: 'M20E-065', restrictionStatus: '', name: 'ブラックホール', productName: 'モンスター・コレクションDeus', cardCategoryName: '戦闘スペル', restrictionNote: '' },
      { id: 'M20E-069', referenceLabel: 'M20E-069', restrictionStatus: '1枚制限', name: 'デーモン・トレード', productName: 'モンスター・コレクションDeus', cardCategoryName: '儀式スペル', restrictionNote: '' },
      { id: 'M20E-073', referenceLabel: 'M20E-073', restrictionStatus: '2枚制限', name: 'スペクター', productName: 'モンスター・コレクションDeus', cardCategoryName: 'トークン', restrictionNote: '' },
    ]
  },
  {
    sectionTitle: '《ウズメ》と紐づくカード',
    sectionNote:  '次のカードは、召喚術師カードとして《ウズメ》を採用している場合にだけ採用可能です。',
    sectionNoteColor: UI_COLORS.WHITE,
    rows: [
      { id: 'M20F-010', referenceLabel: 'M20F-010', restrictionStatus: '', name: '鬼神法「覇」', productName: '双星のシャンバラ', cardCategoryName: '戦闘スペル', restrictionNote: '' },
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
      { id: 'M20F-025', referenceLabel: 'M20F-025', restrictionStatus: '', name: 'ゼロ・フィールド', productName: '双星のシャンバラ', cardCategoryName: '戦闘スペル', restrictionNote: '' },
      { id: 'M20F-026', referenceLabel: 'M20F-026', restrictionStatus: '1枚制限', name: 'コメット', productName: '双星のシャンバラ', cardCategoryName: '儀式スペル', restrictionNote: '' },
      { id: 'M20F-027', referenceLabel: 'M20F-027', restrictionStatus: '2枚制限', name: '時の扉', productName: '双星のシャンバラ', cardCategoryName: 'トークン', restrictionNote: '' },
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
      { id: 'M20F-050', referenceLabel: 'M20F-050', restrictionStatus: '', name: 'エンジェル・リング', productName: '双星のシャンバラ', cardCategoryName: '戦闘スペル', restrictionNote: '' },
      { id: 'M20F-053', referenceLabel: 'M20F-053', restrictionStatus: '1枚制限', name: 'セブン', productName: '双星のシャンバラ', cardCategoryName: '儀式スペル', restrictionNote: '' },
      { id: 'M20F-054', referenceLabel: 'M20F-054', restrictionStatus: '1枚制限', name: 'コロナ', productName: '双星のシャンバラ', cardCategoryName: 'トークン', restrictionNote: '' },
      { id: 'M20F-055', referenceLabel: 'M20F-055', restrictionStatus: '1枚制限', name: 'ティンクルスター', productName: '双星のシャンバラ', cardCategoryName: 'トークン', restrictionNote: '' },
    ]
  },
]


export const mockRestrictionNoticeItems = [
  { id: 'priority', text: '適用優先順位: 禁止 ＞ 期間禁止 ＞ 期間制限 ＝ 封印制限' },
  { id: 'updated', text: '最終更新日: 2026-04-22' }
]

export const mockRestrictionPolicyNotes = [
  { id: 'deck', text: 'デックは50枚構築、同名カードは3枚まで。オープン環境で使用可能な全プールから選択できます。' },
  { id: 'title', text: 'タイトルカードは記載された勢力・属性条件を満たす場合のみ採用可能です。' },
  { id: 'term', text: '適用期間: 2026年4月1日〜次回改訂告知前日まで' }
]

export const mockAvailableExpansions = [
  { id: '6d', label: '6D: 悠久のハルシオン' },
  { id: '6c', label: '6C: アゾールの黒い旋風' },
  { id: '6b', label: '6B: 紅河の戦慄' },
  { id: '5d', label: '5D: 魔海神の魔壺' },
  { id: '5c', label: '5C: 剣姫' },
  { id: '4d', label: '4D: 天空の覇者' },
  { id: '4c', label: '4C: 神霊獣の咆哮' }
]

export const mockBannedRestrictionSourceRows = [
  { id: 'b1', setCode: '6D', cardName: '禁書庫のアークデーモン', category: 'ユニット', restrictionType: '禁止', period: '2026-04-01〜' },
  { id: 'b2', setCode: '6C', cardName: '終焉のブラックホール', category: '戦闘スペル', restrictionType: '期間禁止', period: '2026-04-01〜2026-07-31' },
  { id: 'b3', setCode: '6B', cardName: '次元断のミラージュ', category: '地形', restrictionType: '禁止', period: '2026-04-01〜' },
  { id: 'b4', setCode: '5D', cardName: '冥界門のパンドラ', category: '儀式スペル', restrictionType: '期間禁止', period: '2026-04-01〜2026-12-31' },
  { id: 'b5', setCode: '5C', cardName: '零域のタイダルウェーブ', category: '戦闘スペル', restrictionType: '禁止', period: '2026-04-01〜' },
  { id: 'b6', setCode: '4D', cardName: '影縫いのグラビティ', category: '装備品', restrictionType: '期間禁止', period: '2026-04-01〜2026-10-31' }
]

export const mockLimitedRestrictionSourceRows = [
  { id: 'l1', setCode: '6D', cardName: '双極のタイタン', category: 'ユニット', restrictionType: '期間制限', period: '2026-04-01〜2026-09-30' },
  { id: 'l2', setCode: '6D', cardName: '暴威のフェンリル', category: 'ユニット', restrictionType: '封印制限', period: '2026-04-01〜' },
  { id: 'l3', setCode: '6C', cardName: '魔弾のスナイパー', category: '戦闘スペル', restrictionType: '期間制限', period: '2026-04-01〜2026-08-31' },
  { id: 'l4', setCode: '6B', cardName: '霧都のアサシン', category: 'ユニット', restrictionType: '封印制限', period: '2026-04-01〜' },
  { id: 'l5', setCode: '6B', cardName: '崩落のゲート', category: '地形', restrictionType: '期間制限', period: '2026-04-01〜2026-10-31' },
  { id: 'l6', setCode: '5D', cardName: '聖域のグリフォン', category: 'ユニット', restrictionType: '封印制限', period: '2026-04-01〜' },
  { id: 'l7', setCode: '5C', cardName: '幽冥のヴェール', category: '儀式スペル', restrictionType: '期間制限', period: '2026-04-01〜2026-12-31' },
  { id: 'l8', setCode: '5C', cardName: '時逆のクロノス', category: 'ユニット', restrictionType: '封印制限', period: '2026-04-01〜' },
  { id: 'l9', setCode: '4D', cardName: '雷刃のハルバード', category: '装備品', restrictionType: '期間制限', period: '2026-04-01〜2026-11-30' },
  { id: 'l10', setCode: '4C', cardName: '深森のアルラウネ', category: 'ユニット', restrictionType: '封印制限', period: '2026-04-01〜' }
]
