import finderReleaseNoteFile from '~~/app/utils/mockData/items/about_release_note.json'

export const mockAboutItems = [
  {
    id: 'overview',
    subheading: '概要',
    text: '本サイトは「モンスター・コレクション」関連作品のカード検索および各種情報を扱う非公式ファンサイトです。'
  },
  {
    id: 'independence',
    subheading: '本サイトの位置づけ',
    text: '本サイトは個人が独自に制作・運営するものであり、他の検索サイト等とは関係ありません。'
  },
  {
    id: 'contentPolicy',
    subheading: '掲載方針',
    text: '公式資料の文章を一部引用しています。見出しや関連カード情報等は、当サイトでカードデータに基づき整理しています。'
  },
  {
    id: 'copyright',
    subheading: '著作権・商標',
    text: '掲載しているテキスト・各種データおよび名称等の権利は、各権利者に帰属します。'
  },
  {
    id: 'disclaimer',
    subheading: '免責事項',
    text: '掲載情報の完全性・最新性を保証するものではありません。正確な情報は必ず公式情報をご確認ください。'
  }
]

export const mockAboutThanksItems = [
  {
    id: 'creators',
    subheading: '開発・歴代運営元',
    text: '作品を生み出し、長年にわたりその歩みを支えてこられた開発元・歴代運営元の皆さまに、心より感謝申し上げます。'
  },
  {
    id: 'monsachi',
    subheading: 'モンサチ 様',
    text: '長年プレイヤーに愛された検索サイト「モンサチ」様より着想を得て開発いたしました。その存在に、心より感謝申し上げます。'
  },
  {
    id: 'players',
    subheading: 'プレイヤー・コミュニティ',
    text: '日々ゲームを支え盛り上げている皆さまに感謝いたします。本サイトも、その一助となれば幸いです。'
  }
]

export const mockAboutHistoryHeaders = [
  { title: '日付', key: 'date', sortable: false },
  { title: 'バージョン', key: 'version', sortable: false },
  { title: '更新内容', key: 'update', sortable: false }
]
export interface FinderReleaseNote {
  id: string,
  date: string,
  version: string,
  update: string,
}
export const mockAboutHistorySourceRows: FinderReleaseNote[] = finderReleaseNoteFile as unknown as FinderReleaseNote[]

export const mockAboutContactItems = [
  {
    id: '1',
    title: 'X（旧Twitter）',
    subtitle: '@Oosunakun',
    icon: 'mdi-twitter',
    href: 'https://x.com/Oosunakun'
  },
  {
    id: '2',
    title: 'GitHub',
    subtitle: 'Oosunakun/monsearch',
    icon: 'mdi-github',
    href: 'https://github.com/Oosunakun/monsearch'
  },
]
