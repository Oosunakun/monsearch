export type QuestionAnswerItem = {
  id: string

  question_no?: string
  post_date?: string
  category?: string
  cards?: TargetCard[]
  question: string
  answer: string

  source_name: string
}
export type TargetCard = {
  card_id?: string
  name: string
}

export type RuleSupplementItem = {
  id: string

  post_date?: string
  category?: string
  cards?: TargetCard[]
  text: string

  source_name: string
}

/**
 * 裁定種別の定義
 */
export type RulingType = 'text_change' | 'errata' | 'text_individual'

/**
 * 共通のベースインターフェース
 */
interface BaseCardRuling {
  id: string | number
  type: RulingType
  post_date: string    // 掲載日 (YYYY/MM/DD)
  cards?: TargetCard[]
  source_name: string
}

/**
 * テキスト変更（記述の明確化など、ゲーム的な効果変更なし）
 */
export interface TextChangeRuling extends BaseCardRuling {
  type: 'text_change'
  category?: string
  subCategory?: string
  change_text: string  // 変更内容
}

/**
 * テキスト変更（記述の明確化など、ゲーム的な効果変更なし）
 */
export interface TextIndividualRuling extends BaseCardRuling {
  type: 'text_individual'
  notice: string
  change_text: string  // 変更内容
}

/**
 * エラッタ（ゲーム的な効果変更、カードの修正）
 */
export interface ErrataRuling extends BaseCardRuling {
  type: 'errata'
  effective_date: string // 適用開始日
  errata_text: string   // 修正内容
  revision_reason: string // 修正理由
}

/**
 * カード裁定アイテムの統合型
 */
export type CardRulingItem = TextChangeRuling | ErrataRuling | TextIndividualRuling