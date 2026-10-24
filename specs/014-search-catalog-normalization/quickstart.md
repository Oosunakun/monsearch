# Repository内の検証ガイド: Search Catalog Normalization

本書は仕様・PlanのHuman Review承認後に使う実装・検証手順である。承認前に実装せず、承認後は承認された範囲で以下を実行する。

[検索契約](contracts/catalog-search.md)と[受入契約](contracts/acceptance-evidence.md)を正とする。検証対象はRepository内のcards.json、TypeScript検索処理、Unit Test、API Test、既存フォーム／検索ページの自動回帰と通常のlint・typecheck・build。提供工程の証跡は前提にしない。

## 1. 入力と事前baseline

- 現行482件の両catalogは受領済み。存在・string型・N₀固定点の事前確認はPASSで、再提供待ちにはしない。
- 正常入力のstring契約と欠測fixtureの非ヒット規則を区別する。
- 既存lockfileと互換のNode/npm・依存・Nuxt準備済み環境を使う。環境エラーを実装失敗と混同せず、独断で依存・設定・権限を変更しない。
- 同じJSONでcatalog条件なしの既存Unit/API結果を記録する。過去の別入力の結果を対象実装の成功としない。

実装前にRepository rootで実行する対象コマンド:

```powershell
npm test -- --run server/utils/cardSearch server/api/cards.get.test.ts app/utils/search app/composables/useCardSearchForm.test.ts app/pages/cards/search.test.ts
```

入力のpath・version・件数と必要な識別情報、command・exit code・失敗内容を記録する。既存失敗を無関係な期待値修正で隠さない。

## 2. 実装後の自動確認

```powershell
npm test -- --run server/utils/cardSearch server/api/cards.get.test.ts app/utils/search app/composables/useCardSearchForm.test.ts app/pages/cards/search.test.ts
```

新normalizerのUnit Testも同ディレクトリの対象に含める。指定した既存2テストはフォーム状態・URL復元・検索画面の入力／遷移を自動回帰するもので、ブラウザー速度測定や人間の手動確認ではない。

続けて既存の通常品質検証を行う。

```powershell
npm run lint
npx --no-install nuxt typecheck
npm run build
```

lint / buildは既存package.jsonのscriptを使用する。typecheck専用npm scriptはないため、既存ローカルNuxt CLIと導入済みvue-tscを使う。依存の追加・更新を前提にしない。これらは性能測定ではなく通常の品質検証であり、CPU数値基準や実機・手動確認を追加するものではない。コマンドの記載は実行成功の記録ではない。

| 対象 | 期待結果 |
|---|---|
| N₀ | 幅対応172文字・ASCII大文字26文字・境界・非同一視・カナ合成省略・内部空白保持・冪等性が固定期待値と一致 |
| 入力JSON | 両catalogの文字列型・状態・N₀固定点をRepository内で確認。不適合をruntimeで補修しない |
| matcher | catalogだけの語がhit、表示だけの語は非hit。欠損/null/空値は非hit、kw/attはAND |
| 保持 | criteria・カード原文・URLを照合用に変更しない。既存Parserのtrimは維持 |
| API | 固定期待全ID集合、件数、categoryBreakdown、sort、pagination、応答項目が一致 |
| 回帰 | nm / rlの小文字化、etxのnormalizeQdsText・カナ合成・同一Effect条件を維持。既存フォームの独立状態・検索ページのURL復元／遷移も確認 |
| Token | is_tokenの型・値と既存Token分類を維持 |

期待値を本番normalizerやmatcherで生成して自己比較しない。新規不具合は解消し、既存失敗・環境失敗はlogとともに分ける。全件成功でない場合はそのまま報告する。

## 3. API Testの代表シナリオ

実server・ブラウザーを起動せず、既存handlerのAPI Testと固定fixtureで確認する。

| シナリオ | 確認内容 |
|---|---|
| ラベル | Ｍ２０Ａ－００１とm20a-001の固定全ID集合が同じ |
| catalog固有語 | full_text / archetype_textだけにある語はhitし、表示欄だけの語は非hit |
| archetype | att単独・kw併用が固定期待集合と一致 |
| literal | *・+・括弧・内部空白・改行・タブを演算子化・圧縮しない |
| 非同一視 | 丸数字、ローマ数字、ひらがな/カタカナ、波ダッシュ、類似ハイフンを区別 |
| 合成省略 | kw / attはカ＋U+3099を合成しない。etxは既存の合成を維持 |
| 原文・URL | 既存Parser/Builder、入力snapshot、API投影原文で照合用変換を書き戻さないことを確認 |
| 複合・分類 | 他条件とAND、is_tokenによる分類、sort各方向、20/50/100件、page境界を維持 |

全ページのID集合を確認し、perPage=100の先頭ページだけで全集合としない。実データにない陽性・境界は小さい固定fixtureで補う。原文を確認しただけで画面の手動確認まで実施済みとはしない。

## 4. 性能に関する構造確認

[受入契約G4](contracts/acceptance-evidence.md)に従う。

1. APIとsearchCardsで有効な各catalog検索語のN₀呼出を確認する。走査前に各1回、カード走査中は0回とする。
2. カード数を変えたfixtureでもqueryの変換回数が増えないことを確認する。
3. 対象全文を生成せず、受領済みcatalogだけに照合する。表示語しかないfixtureの非ヒットで代用連結を防ぐ。
4. 未正規化catalogのfixtureを検索時に再正規化しないことを確認する。
5. 既存分類・sort・pagination・集計・API契約の回帰がないことを確認する。

CPU反復測定・中央値改善、実機性能測定、ブラウザー定量測定、人間の実動作確認は必須工程から削除した。計測runnerの作成は要求しない。未実施を達成扱いせず、その未実施だけでImplementationを未完了にも戻さない。

## 5. 完了報告

G1〜G4・SC-001〜004の結果に加え、フォーム／検索ページ回帰とlint・typecheck・buildの実結果、command・log・既存失敗・新規差分をまとめる。必要な自動検証の証跡はverification/へ保存する。提供工程の調査・証跡・実機測定の不足は受入未完了の条件にしない。

実行した確認とその結果だけを記録し、未実施の検証を成功扱いしない。手順の記載と実行結果を区別する。
