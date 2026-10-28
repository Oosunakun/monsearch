# 検証ガイド: 検索結果の並び順

**状態**: D1・D2承認反映済み。統合Human Reviewの完了確認と実装工程の許可後に行う手順。2026-10-29のArtifact修正では未実行。

## 前提

Spec + Plan統合Human Reviewと実装工程の許可を得てから実施する。現在はTasks・Implementationへ進めない。[契約](contracts/search-result-sorting.md)の固定期待例と[Plan](plan.md)のoracle移行方針を基準にする。

- branch/HEAD/差分、cards.json・lock・Feature 014 oracleのhashを記録する。
- 既存依存を使用し、新依存・インフラを追加しない。必要なNuxt生成準備は実装検証時に環境を確認して行う。
- 過去のPoC/T1/T2成果物を再利用して成功扱いにせず、上書きしない場所で今回のソースを検証する。

## 自動検証（実装後）

既存のNuxt/Vitest環境が準備済みのRepositoryまたは承認済み隔離workspaceで実行する。

```powershell
npm run test -- --run server/utils/cardSearch/sort.test.ts shared/cardSearch/runner.test.ts server/api/cards.get.test.ts app/composables/useCardSearch.test.ts app/components/cards/result/layout/ResultList.test.ts
npm run test -- --run
npm run lint
.\node_modules\.bin\nuxt.cmd typecheck
```

| 検証 | 必須の期待結果 |
|---|---|
| 6キー×2方向 | id / level / atk / defense / initiative / rarityの全キーが補正でidへ落ちず、手書き期待順序と一致。id/rarityは旧規則維持 |
| 4数値キー | 契約のgroup・0/NULL・正負数・同値例に一致。値なしは両方向末尾 |
| sourceIndex | 入力をシャッフルしても同値は元sourceIndex順。source/card/criteria不変 |
| runner/API/CSR | 新期待順序と完全DTO、全ID、totalCount、categoryBreakdown一致。旧oracleの不変部分も一致 |
| ページング | 20/50/100、先頭/中間/最終/範囲外/0件。全ページ連結が期待全件順、重複・欠落なし |
| 表示制御 | 新キー・方向変更でpage=1、perPage保持。無効key/orderは個別既定値、表示も同期 |
| Lifecycle | ready、query変化、retry、古い応答・離脱保護維持。JSON loader共有、API fallbackなし |
| PC/モバイル | ResultDisplaySettingsを全てstubして済ませず、両レイアウトの選択肢・表示順・操作を検証 |

D2承認に従い、旧Feature 014のSpec・Plan・oracle・検証記録を変更せず、旧atkの6ケースに旧順序を要求する現在のテストコードは015期待値を使う形へ更新する。失敗回避のskipではなく、同じページ境界・DTO・集計coverageを維持する。新しいソート自身から期待値を生成しない。今回はテストコード・fixtureを変更しない。

## 静的生成監査（実装後・旧成果物保護）

隔離された新出力先で`npm run generate`を実行し、終了codeと警告を保存する。

1. `/`、`/cards`、`/about`、`/cards/search`、`/rules`、`/restrictions`、`/links`、`/tournaments`のHTMLと404.html。
2. `.output/public/data/cards.json`が正本とbytes/SHA一致。`_headers`のno-cache維持。
3. 公開対象`.output/public`にWorker、SSR renderer、API snapshotなし。
4. 全カードJSONがブラウザーJS/HTML/payloadに混入していないことをimport経路と生成物両面で監査する。カードID/catalog等の検索だけを唯一の証拠にしない。
5. cards.json、Schema、検索条件、nuxt.config、旧oracleが変更されていないことを確認する。

## Human画面確認（自動テストと別記録）

承認されたローカル静的配信環境を使い、PCとモバイル幅のChromeで行う。外部deployは本Featureの検証前提にしない。

- `/cards`でカードNo→レベル→攻撃力→防御力→イニシアチブ→出現頻度の表示順と名称、初期id/asc、適用状態を確認。
- 全6項目のasc/desc、unit/equip/値なしを含む結果、0と欠損、同値順を確認。実データにない例は自動合成テストの根拠と区別する。
- 2ページ目からsort/order変更でpage=1、20/50/100変更、戻る/進む・検索条件変更が従来どおりであることを確認。新しいsortのURL永続化は期待しない。
- `/cards?kw=ダメージ`の149件、`cc=summoner&kw=アーニャ`の3件を回帰例にする。同条件でsortを変えても全件数・分類集計を維持する。
- Networkで初回JSON取得、sort変更によるJSON追加ダウンロードなし、通常検索の/api/cards通信0件。Console/Hydrationエラーなし。
- 比較APIはテスト内で検証する。本番静的配信で/api/cardsを復活させない。

## 判定

自動品質・生成物・Human画面観測を分けて記録し、未実施をPASSにしない。未知の仕様変更やscope拡張が必要ならHumanへ戻す。今回の文書Reviewではこの検証手順が実行可能かを評価し、実測成功とは扱わない。
