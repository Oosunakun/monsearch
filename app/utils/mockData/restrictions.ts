export const mockRestrictionHeaders = [
  { title: 'セットコード', key: 'setCode', sortable: false },
  { title: 'カード名', key: 'cardName', sortable: false },
  { title: 'カテゴリ', key: 'category', sortable: false },
  { title: '種別', key: 'restrictionType', sortable: false },
  { title: '適用期間', key: 'period', sortable: false }
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
