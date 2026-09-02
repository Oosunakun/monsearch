# Quickstart: カードセット収録カード検索の検証

## Prerequisites

- Node.js と npm が利用可能であること
- repository root が current directory であること
- `npm install` 済みであること
- model と navigation contract は [data-model.md](data-model.md) と [contracts/card-set-navigation.md](contracts/card-set-navigation.md) を参照すること
- URL Query の Source of Truth は [Query Specification](../../docs/architecture/query_specification.md) を参照すること

## Automated Validation

```powershell
npm test -- --run
npx vue-tsc --noEmit
npm run lint
npm run build
```

Expected:

- product search location の Unit Test が、有効値では `pd` だけを含む `/cards` location、空・未知値では location なしを確認する。
- component test が、カードセット名の pointer/keyboard 操作だけで navigation し、備考・発売日・余白では navigation しないことを確認する。
- page/component test が、`/` と `/restrictions`、desktop と mobile の全組み合わせで、同一 `searchValue` から同一の `{ path: '/cards', query: { pd } }` を生成することを確認する。
- parser/navigation test が、生成された URL Query を新しい route state として読み込んだ場合に `SearchForm.products` が同じ1件へ復元され、ほかの fields が既存 defaults であることを確認する。
- 同一表示名で異なる許可済み value を持つ fixture が、それぞれ異なる `pd` を生成する。
- TypeScript strict check、lint、既存 test、production build が成功する。

## Manual End-to-End Validation

1. 開発 server を起動する。

   ```powershell
   npm run dev
   ```

2. トップページ `/` の「カードセット」一覧を desktop viewport で開く。
3. 「太陽の金の竜姫」のカードセット名を選択する。
4. `/cards?pd=91122d7e` に相当する URL が開き、ほかの query condition がないことを確認する。
5. 検索条件表示が選択したカードセットを判別可能で、結果にはそのセット収録カードだけが含まれることを確認する。
6. 開いたページを reload し、同じカードセット条件と結果が復元されることを確認する。
7. URL を bookmark から開く、新しい tab に貼り付ける、別 browser context へ共有する操作を行い、いずれも同じカードセット条件と結果が復元されることを確認する。
8. `/restrictions` の「使用できるカードセット」一覧から同じカードセットを選択し、手順4と同じ URL Query、条件、結果になることを確認する。
9. 両画面へ戻って備考、発売日、略称、行余白を選択し、遷移しないことを確認する。
10. mobile viewport でも両画面について手順3〜9を繰り返す。
11. keyboard の Tab でカードセット名へ focus し、Enter で pointer 操作と同じ結果を開けることを確認する。

## Edge Validation

- 日本語・空白・記号を含む表示名でも、URL には名称でなく対応する一意な `pd` value が入る。
- 同名 fixture 2件に異なる許可済み value を与え、それぞれ選択した row の value だけが `pd` となる。
- 表示可能カード0件の有効 set を選び、`pd` を保持した結果なし状態が表示される。
- invalid/empty `searchValue` fixture では名称から推測せず、検索画面へ遷移しない。
- 異なる名称を連続選択し、最後の navigation location に最後の `pd` 1件だけがある。
- `/` と `/restrictions` の同一カードセットを選択し、logical location が完全一致する。
- `/cards?pd=91122d7e` を一覧画面の state なしで直接開き、既存 parser が同じ1件の product 条件を復元する。

## Success Criteria Measurement

- SC-001: 一覧表示後、カードセット名の1操作で結果 route が開く。
- SC-002/SC-005: valid、同名、特殊表示名、0件 fixture の automated/E2E cases をすべて通過する。
- SC-003: browser performance measurement を複数回行い、選択から結果確認可能までの p95 が1秒以内である。
- SC-004: usability session で説明なしの初回成功率を記録し、90%以上を確認する。
- SC-006: `/`、`/restrictions`、desktop、mobile の matrix で同一カードセットの location と検索条件がすべて一致する。
- SC-007: reload、bookmark、新しい tab、共有 URL の全ケースで同一カードセット条件が復元される。

### Implementation Validation (2026-09-02)

- Automated gates: `npm test -- --run` (15 files / 62 tests)、`npx vue-tsc --noEmit`、`npm run lint`、`npm run build` は成功。
- Browser matrix: headless Microsoft Edge で `/`、`/restrictions` × desktop (1280x800)、mobile (390x844) の pointer / keyboard navigation がすべて `/cards?pd=91122d7e` へ到達。
- SC-003: development server 上の20 samples は min 230 ms、p95 1185 ms、max 1193 ms。1秒基準は未達。production deployment 相当環境での再測定が必要。
- SC-004: 人間の初回利用者を対象とする usability session は、この自動実装環境では未実施。説明なし初回成功率は未確定。
- SC-006/SC-007: browser matrix と router/parser tests で、起点・viewport・再読込・fresh router にかかわらず同じ `pd` 1件が復元されることを確認。

### Human Acceptance (2026-09-02)

- `npm run dev` で実画面を確認し、カードセット名が下線および pointer cursor によりリンクとして識別可能であり、操作時の応答性にも実用上の違和感がないことを確認した。
- SC-003 の p95 1秒以内、および SC-004 の説明なし初回成功率90%以上について、定量基準そのものの達成は確認していない。個人開発における本 Feature の検証コストとのバランスを考慮し、今回は上記の目視・操作確認を Human Acceptance として採用した。
- カードセット名のリンク識別性には改善余地があるが、将来的にカードID、種族、カードタイプ等も遷移可能になる可能性があり、リンク表現の統一は本 Feature の Scope では決定しない。
- 以上をもって、本 Feature の実装を受け入れる。