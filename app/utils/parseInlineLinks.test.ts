// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { parseInlineLinks } from './parseInlineLinks'

describe('parseInlineLinks', () => {
  it.each(['', '通常の説明。 前後の空白 ', '<img src=x onerror=alert(1)>'])('リンクなしの入力をそのまま保持する: %s', text => {
    expect(parseInlineLinks(text)).toEqual([{ type: 'text', text }])
  })
  it('複数リンクの表示名・URL・順序と前後の空白・句読点を保持する', () => {
    expect(parseInlineLinks(' 前文。[一つ目](https://example.com/a?x=1&y=2)、 [二つ目](https://example.org/#details) 後文。 ')).toEqual([
      { type: 'text', text: ' 前文。' },
      { type: 'link', text: '一つ目', href: 'https://example.com/a?x=1&y=2' },
      { type: 'text', text: '、 ' },
      { type: 'link', text: '二つ目', href: 'https://example.org/#details' },
      { type: 'text', text: ' 後文。 ' },
    ])
  })
  it('隣接リンクとURLの表記を保持する', () => {
    expect(parseInlineLinks('[A](HTTPS://EXAMPLE.COM/path)[B](https://example.org)')).toEqual([
      { type: 'link', text: 'A', href: 'HTTPS://EXAMPLE.COM/path' },
      { type: 'link', text: 'B', href: 'https://example.org' },
    ])
  })
  it.each([
    '[未完了](https://example.com', '[未完了(https://example.com)', '[](https://example.com)',
    '[空URL]()', '[HTTP](http://example.com)', '[相対](/about)', '[省略](//example.com)',
    '[script](javascript:alert(1))', '[data](data:text/html,test)', '[不完全](https://)',
    '[空host](https:///example.com)', '[省略slash](https:example.com)',
    '[認証](https://user:password@example.com)', '[空白](https://example.com/a b)',
    '[改行](https://example.com/\nb)', '[backslash](https://example.com\\evil)',
    '![画像](https://example.com/image.png)', '\\[escaped](https://example.com)',
    '[title](https://example.com "title")', '[nested [label](https://example.com)]',
    '[nested [label]](https://example.com)', '[括弧](https://example.com/a(b))',
    '[改\n行](https://example.com)', '[参照][name]',
  ])('不正・未対応・不許可の入力はリンク化しない: %s', text => {
    expect(parseInlineLinks(text)).toEqual([{ type: 'text', text }])
  })
  it('不許可リンクの後でも独立した有効リンクを認識する', () => {
    expect(parseInlineLinks('[不可](http://example.com) [可](https://example.com)')).toEqual([
      { type: 'text', text: '[不可](http://example.com) ' },
      { type: 'link', text: '可', href: 'https://example.com' },
    ])
  })
  it('表示名のHTML風文字列をデータとして保持し、HTMLを生成しない', () => {
    expect(parseInlineLinks('[<img src=x>](https://example.com)')).toEqual([
      { type: 'link', text: '<img src=x>', href: 'https://example.com' },
    ])
  })
})
