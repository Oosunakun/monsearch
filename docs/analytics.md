# GA4計測の設定・確認

## 構成

gtag.jsをclient pluginから直接ロードする。追加npm依存なし。SSG＋CSR、検索URL、検索runner、Pages Direct Uploadは変更しない。計測失敗は検索へ伝播させない。

- `page_view`：初回・確定したSPA遷移に1回。
- `search_submit`：簡易／詳細検索の操作ごとに1回。同一URLへの再検索も数える。
- `search_results`：現在の訪問の検索結果successに1回。`search_mode`、`result_count`（全件数）、`zero_results`（0/1）、検索結果URLを送る。

検索操作のintentはメモリー内でrouter遷移に引き継ぎ、URLに計測用parameterを追加しない。直リンクは`direct`、履歴復帰は`history`、その他は`other`。ページ送り・sort・表示件数・refreshは新しい検索結果eventにしない。失敗・古い応答は記録せず、retryで初めて成功した結果は記録する。訪問ごとの抑制は通信到達のexactly-onceを保証しない。

## 有効化条件

`runtimeConfig.public.analytics`は既定で無効・IDなし。以下すべて成立した場合のみtagをロードする。

| 環境変数 | 条件 |
|---|---|
| `NUXT_PUBLIC_ANALYTICS_ENABLED` | `true` |
| `NUXT_PUBLIC_ANALYTICS_MEASUREMENT_ID` | 有効な`G-`形式の測定ID |
| `NUXT_PUBLIC_ANALYTICS_ALLOWED_ORIGIN` | `https://monsearch.gifumoko.net` |
| `NUXT_PUBLIC_ANALYTICS_ENVIRONMENT` | `production` |
| browser | dev buildではなく、現在originが許可originと一致 |

GitHub Actionsでは元Repository `Oosunakun/monsearch`の`main` pushだけが注入対象。Repository Variables `GA4_ENABLED=true`と`GA4_MEASUREMENT_ID`を使用する。未登録時・Preview（develop）・PR・Forkは無効で、測定IDを埋め込まない。

**実測定IDの設定先はGitHub Repository Variablesのみとし、Repositoryやローカルファイル（`.env`を含む）へ保存しない。** 測定IDはブラウザーへ公開される識別子で、認証用Secrets（API token等）とは異なる。生成された本番artifactにはIDが含まれるため、Secretsへ格納しても配信時の秘匿はできない。公開IDへの悪意ある第三者送信まで防止するものではない。

Variablesの登録・Google側設定・公開作業は運用担当者が行う。品質GateとDirect Upload方式は維持する。無効artifactにはIDなし、有効artifactには本番origin・正しい設定があることを監査する。Direct Upload後の環境変数変更では静的artifactは変わらず、停止にも無効設定で再生成・再配信が必要。

## 公開前に必要なGoogle側設定

1. GA4 property／web streamの所有者・設定担当・本番確認担当を確定し、測定IDを照合する。これらはGoogle管理画面で設定する。
2. **拡張計測をOFF**にする（履歴変更PV・site search・form・outbound等の自動送信を停止）。コードの`send_page_view:false`だけでは履歴PVは止まらない。`view_search_results`は不採用。[Google公式PV仕様](https://developers.google.com/analytics/devguides/collection/ga4/views)
3. web streamの標準email data redactionを有効確認する。query parameter redactionは分析不要キー（例：email/phone/name/address）の一覧をReviewし設定する。分析対象の`nm/kw/att/etx/rt/rl`等を丸ごと除去する設定にはしない。管理画面の合成入力テストで確認する。[標準データ除去仕様](https://support.google.com/analytics/answer/13544947?hl=en)
4. Ads連携・Google signals・広告パーソナライズをOFFとし、Google側の実設定を確認する。コードもsignals／広告パーソナライズを無効にしている。
5. イベント・ユーザーデータ保持を2か月に設定する。Cookie（通常最大2年）とは別設定。Aboutと実Cookie設定を照合する。
6. event scope custom dimensionに`search_mode`、`zero_results`、`query_truncated`、custom metricに`result_count`を登録する。全文URLの独自dimension複製は不要。

## URL・PIIの扱いと残存リスク

検索query値（日本語・自由入力含む）は保持する。独自PII検知・置換は実装しない。既知の検索キーを計測URLへ転記し、未知キー・hashは送らない。非検索画面は固定path、外部referrerはoriginのみ。長さ上限はencode後URL 1,000文字、referrer 420文字。超過時はparameter単位で省略し`query_truncated=1`とする。

標準email除去はbest effortで、任意の検索値に入った電話番号・氏名・住所等を網羅的に除去しない。送信前のメモリーqueueにも未除去検索値が含まれ得る。queueは最大50コマンド・30秒、永続化・console出力・自動再送なし。Google標準機能を利用してもPII非送信・法令・Google規約への適合確認済みとは扱わない。混入発見時は無効化・影響確認・GA4削除手続き・方針再Reviewを行う。

Aboutは利用目的・送信先・Cookie・公式opt-out案内を掲載する。独自停止UI・同意modal・CMPは追加しない。公式拡張機能は全端末対応ではない。EEA等の同意未対応リスクは残る。地域別CMPは公開後ASAPで優先検討し、固定期限は設けない。

## ローカル通常起動とmock検証

通常の`npm run dev`ではGA4は無効で、タグをロードせず、計測イベントの自動コンソール出力も行わない。開発用ログやローカルから実GA4へ送信する例外モードはない。イベントを確認する場合は、ダミーIDとmock gtagを使用するブラウザーテストを実行する。

`npm run lint`、`npx nuxt typecheck`、`npm run test -- --run`、`npm run generate`、`node scripts/verify-pages-artifact.mjs`を実行する。有効設定での生成・監査は同じ環境変数を両コマンドに渡す。検証に実IDを使わず、ダミーIDと外部通信interceptを使用する。

`node scripts/verify-analytics-browser.mjs`は静的artifactをPlaywrightで本番originに見せ、外部通信をローカル応答・mock gtagへ差し替える。無効時はtag未ロード・GA Cookieなし、有効時はPV・簡易／詳細intent・履歴・同一URL再検索・ページ送りとsortの抑制・長文URL・dataset失敗からのretry・ロード失敗時の検索継続・別origin無効を確認する。Edge以外は`ANALYTICS_BROWSER_PATH`へ実行fileを指定する。

有効設定をmockで検証するPowerShellの例を示す。環境変数は検証用プロセス内だけで指定し、ファイルへ保存しない。以下のIDはダミーであり、実測定IDへ置き換えない。

```powershell
$env:NUXT_PUBLIC_SITE_URL='https://monsearch.gifumoko.net'
$env:NUXT_PUBLIC_ANALYTICS_ENABLED='true'
$env:NUXT_PUBLIC_ANALYTICS_MEASUREMENT_ID='G-TEST123456'
$env:NUXT_PUBLIC_ANALYTICS_ALLOWED_ORIGIN='https://monsearch.gifumoko.net'
$env:NUXT_PUBLIC_ANALYTICS_ENVIRONMENT='production'
npm run generate
node scripts/verify-pages-artifact.mjs
node scripts/verify-analytics-browser.mjs
```

mockで確認できるのは、アプリが送信する予定のイベント・パラメーター・初期設定・共有page context等である。Google側の受信、Google実装による自動イベント・標準データ除去・実Cookie生成は確認できない。この検証用artifactは公開しない。検証後は専用のPowerShellプロセスを閉じ、設定のない新しいプロセスで`npm run generate`を実行すると無効設定のartifactへ戻せる。

## Production公開後の実送信確認

Production公開後に担当者がNetwork／Tag Assistant／DebugViewで以下を確認する。

- 初回PV・SPA遷移が1回で、拡張計測の自動PV等が重複していない。
- `search_submit`と`search_results`、mode、全件数・0件、結果URLが一致する。
- `session_start/user_engagement`等の自動eventにも現在のpage context・標準除去が適用される。手動eventだけの確認で完了としない。
- 標準除去の実挙動、ID・Cookie、公式opt-out、blocker時の検索継続を確認する。生の個人情報を検証に使わない。
- 24〜48時間を目安にquery付きURL・端末/browser・custom定義がレポート／探索に反映されることを確認する。0件率は`zero_results=1`の結果event数／全結果event数とし、直リンク／履歴を含む集計とquick／advancedだけの集計を分ける。

## CMP拡張点

`AnalyticsPolicy.canLoad/canSend`をgtag transportから分離している。将来は同意defaultをtagより前に適用し、CMPからConsent Mode更新へ接続する。basic／advanced、地域不明時の既定、撤回時のqueue破棄を別途設計する。現行policyは同意取得済みを意味しない。現行実装には地域判定API・状態保存・同意UIを含まない。

`canSend`は手動eventと待機queueの境界であり、ロード済みGoogle scriptの自動event停止まで保証しない。CMP導入時はConsent Mode更新・必要なロード停止を別途接続する。
