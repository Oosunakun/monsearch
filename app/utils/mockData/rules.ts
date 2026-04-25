export const mockRuleReplacementHeaders = [
  { title: '変更前', key: 'beforeText', sortable: false },
  { title: '変更後', key: 'afterText', sortable: false },
  { title: '補足', key: 'note', sortable: false }
]

export const mockRuleNoticeItems = [
  {
    id: 'description',
    text: '本サイトのルール解説は公式資料に基づいて作成していますが、非公式の補助情報です。大会参加時は必ず公式規定をご確認ください。'
  },
  { id: 'updated', text: '最終更新日: 2026-04-22' }
]

export const mockRuleConstructionNotes = [
  { id: '1', text: 'デック枚数は50枚ちょうどで構築します。' },
  { id: '2', text: '同名カードは3枚まで採用可能です（カード別の個別制限が優先）。' },
  { id: '3', text: 'タイトルカードは勢力条件を満たした場合のみ有効です。', emphasized: true },
  { id: '4', text: '制限カード・禁止カードの判定は対戦当日のレギュレーションを適用します。', emphasized: true },
  { id: '5', text: '公式イベントでは最新FAQ・裁定更新を優先して適用します。' }
]

export const mockRuleReplacementSources = [
  { id: 'r1', beforeText: '即時召喚可能', afterText: 'このカードは即時召喚できる', note: '最新の効果文テンプレートへ統一' },
  { id: 'r2', beforeText: '普通召喚フェイズ', afterText: '召喚フェイズ', note: 'フェイズ名称の統一' },
  { id: 'r3', beforeText: '対象ユニット1体を行動完了にする', afterText: '対象ユニット1体を行動完了状態にする', note: '状態語の明確化' },
  { id: 'r4', beforeText: '捨て山', afterText: '墓地', note: 'ゾーン名称の現行化' }
]
