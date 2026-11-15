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

export interface AboutAnalyticsItem {
  id: string
  text: string
}

// 段落前後・文間の空白も、既存の表示テキストと同じに保つ。
export const mockAboutAnalyticsItems: AboutAnalyticsItem[] = [
  {
    id: 'purpose',
    text: ' 当サイトの正式公開環境では、検索機能の使いやすさの改善と開発の優先順位の検討のため、Google Analytics 4を利用します。 閲覧ページ、検索条件を含むURL、簡易・詳細検索の操作、検索結果件数、端末・ブラウザー等の利用情報をGoogleへ送信します。 広告・リマーケティングを目的とした利用は行いません。 '
  },
  {
    id: 'cookies',
    text: ' Cookie（_ga、_ga_から始まるCookie）を使用します。Cookieの有効期間は通常、最終利用から最長2年です。 イベント・ユーザーデータの保持期間は2か月とし、Cookieの期間とは異なります。 Google Analyticsの標準データ除去機能を利用する方針ですが、個人情報の送信を完全に防ぐものではありません。 検索欄にメールアドレス・電話番号・氏名・住所等の個人情報を入力しないでください。 '
  },
  {
    id: 'privacy',
    text: ' 情報の取扱いは [Googleのプライバシーポリシー](https://policies.google.com/privacy)と [Googleによる情報の利用方法](https://policies.google.com/technologies/partner-sites)をご確認ください。 計測を停止する方法は [Google公式のオプトアウト案内](https://support.google.com/analytics/answer/181881?hl=ja)をご参照ください。 オプトアウト用の拡張機能は対応ブラウザーでのみ利用でき、モバイル等では利用できない場合があります。 ご質問は本ページの「お問い合わせ」からご連絡ください。 '
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
