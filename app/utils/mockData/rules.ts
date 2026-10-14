import finderQuestionAnswerFile from '~~/app/utils/mockData/items/rule_question_answer.json'
import finderSupplementFile from '~~/app/utils/mockData/items/rule_supplement.json'
import finderTextChangeFile from '~~/app/utils/mockData/items/rule_text_change.json'
import finderErrataFile from '~~/app/utils/mockData/items/rule_errata.json'
import finderIndividualFile from '~~/app/utils/mockData/items/rule_text_individual.json'

export const mockRuleNoticeItems = [
  {
    id: 'description1',
    text: '本サイトの掲載内容は公式資料に基づく非公式の参照情報です。'
  },
  {
    id: 'description2',
    text: '正確な内容は必ず公式情報をご確認ください。'
  }
]
export interface FinderQuestionAnswer {
  id: string,
  question_no: string,
  post_date: string,
  category: string,
  cards: {
    card_id: string,
    name: string,
  }[],
  question: string,
  answer: string,
  source_name: string,
}
export const mockRuleQuestionAnswerSources: FinderQuestionAnswer[] = finderQuestionAnswerFile as unknown as FinderQuestionAnswer[]

export interface FinderSupplement {
  id: string,
  post_date: string,
  category: string,
  cards: {
    card_id: string,
    name: string,
  }[],
  text: string,
  source_name: string,
}
export const mockRuleSupplementSources: FinderSupplement[] = finderSupplementFile as unknown as FinderSupplement[]

export interface FinderTextChange {
  id: string,
  type: 'text_change',
  post_date: string,
  category: string,
  subCategory: string,
  cards: {
    card_id: string,
    name: string,
  }[],
  change_text: string,
  source_name: string,
}
export const mockRuleTextChangeSources: FinderTextChange[] = finderTextChangeFile as unknown as FinderTextChange[]

export interface FinderErrata {
  id: string,
  type: 'errata',
  post_date: string,
  cards: {
    card_id: string,
    name: string,
  }[],
  effective_date: string,
  errata_text: string,
  revision_reason: string,
  source_name: string,
}
export const mockRuleErrataSources: FinderErrata[] = finderErrataFile as unknown as FinderErrata[]

export interface FinderIndividual {
  id: string,
  type: 'text_individual',
  post_date: string,
  notice: string,
  cards: {
    card_id: string,
    name: string,
  }[],
  change_text: string,
  source_name: string,
}
export const mockRuleTextIndividualSources: FinderIndividual[] = finderIndividualFile as unknown as FinderIndividual[]
