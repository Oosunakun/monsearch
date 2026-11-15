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

export interface AboutAnalyticsItem {
  id: string
  subheading: string
  text: string
}
export const mockAboutAnalyticsItems: AboutAnalyticsItem[] = [
  {
    id: 'purpose',
    subheading: '利用目的',
    text: '当サイトでは、検索機能の改善とサイト運営の参考とするため、Google Analytics 4（GA4）を利用します。'
  },
  {
    id: 'collection',
    subheading: '収集情報',
    text: 'Cookie等を利用し、閲覧ページ、検索条件を含むURL、検索方法、検索結果件数、端末・ブラウザー情報等をGoogleへ送信します。'
  },
  {
    id: 'retention',
    subheading: 'データ保持',
    text: 'GA4のユーザー単位・イベント単位データの保持期間は2か月とする方針です。集計レポートやCookieの保持期間とは異なります。'
  },
  {
    id: 'personal-information',
    subheading: '個人情報',
    text: 'GA4の標準データ除去機能を利用する方針ですが、個人情報の送信を完全に防ぐものではありません。検索欄に個人情報を入力しないでください。'
  },
  {
    id: 'details',
    subheading: '詳細・停止方法',
    text: '[Googleによる情報の利用](https://policies.google.com/technologies/partner-sites)、[Googleのプライバシーポリシー](https://policies.google.com/privacy)をご確認ください。計測の停止方法は[公式オプトアウト案内](https://support.google.com/analytics/answer/181881?hl=ja)をご参照ください。利用できるブラウザーには制限があります。'
  }
]

export const mockAboutContactItems = [
  {
    id: '1',
    title: 'X（旧Twitter）',
    subtitle: '@Oosunakun',
    iconSrc: '/images/brands/x/logo-black.png',
    iconSize: 16,
    href: 'https://x.com/Oosunakun'
  },
  {
    id: '2',
    title: 'GitHub',
    subtitle: 'Oosunakun/monsearch',
    iconSrc: '/images/brands/github/GitHub_Invertocat_Black.svg',
    iconSize: 20,
    href: 'https://github.com/Oosunakun/monsearch'
  },
]
