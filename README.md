# monsearch / モンさーち！

「モンスター・コレクション」関連作品のカード検索および各種情報を扱う、個人制作・運営の非公式ファンサイトです。掲載情報の完全性・最新性を保証するものではありません。正確な情報は公式情報をご確認ください。

## 主な機能・検索方法

- 詳細検索（`/cards/search`）：カード名・キーワード・分類・属性・カードセット・数値・能力や効果等の条件を指定できます。
- 検索結果（`/cards`）：並べ替え、表示件数・ページ切替、条件の編集に対応しています。
- 検索条件はURLで共有・復元できます。例えば`/cards?nm=アーニャ`はカード名による検索です。
- ルール、使用制限、関連リンク、Aboutを掲載しています。

詳細検索で条件を入力して検索すると、結果画面へ移動します。「条件を編集」で検索フォームへ戻れます。検索にはJavaScriptが必要です。

## 技術構成

Nuxt、Vue、TypeScript（strict）、Vuetifyを使用しています。検証にはESLint、Vitest、Nuxt Test Utilsを使用します。依存バージョンは[package.json](package.json)と[package-lock.json](package-lock.json)を参照してください。

配信構成は**SSG＋CSR**です。Nuxtの`static` presetで7ページのHTMLを生成し、カードデータはブラウザーが`/data/cards.json`から取得して検索します。`ssr: true`は生成時の描画にも使われる設定で、公開時にSSRサーバーや検索API・データベースを動かす構成ではありません。

## 開発環境・セットアップ

- Node.js **22.23.4**
- npm **12.2.1**

`packageManager`と`devEngines`でexact版を指定しています。Node/npmの導入やPATHの切替は自動では行いません。以下の`npm`は指定版を選択済みであることを前提とし、Repository rootで実行します。

```sh
node --version
npm --version
npm ci --include=dev --no-audit --no-fund
npm run dev
```

開発サーバーの既定URLは`http://localhost:3000`です。`npm ci`は既存の`node_modules`を置換し、lockに従って開発依存もインストールします。rootの`postinstall`で`nuxt prepare`が実行されます。

npm 12の依存install script制御を維持し、未承認scriptのblockをinstall失敗と区別してください。`--force`、`ignore-scripts`、全scriptの一括許可による回避は行わず、必要なscriptだけ個別に確認します。user/globalのnpm設定も挙動に影響します。

既知のpeer不整合（eslint、cac、commander）は限定受入れ中です。採用後30日または次回Nuxt/ESLint関連依存更新Reviewの早い方で再評価し、新しいinvalid/missingを既知問題として扱わないでください。検証成功は依存整合性や脆弱性の解消を意味しません。

<details>
<summary>既存のglobal npmを更新せず、配置済みのnpm 12 CLIを明示する場合</summary>

PowerShellでは配置先を指定して実行できます。CLIの取得・配置方法は使用環境に合わせて準備してください。自動bootstrapやwrapperはありません。

```powershell
$node = (Get-Command node.exe -CommandType Application | Select-Object -First 1).Source
$npmPrefix = '<配置済みnpm12専用prefixの絶対パス>'
$npmCli = Join-Path $npmPrefix 'node_modules/npm/bin/npm-cli.js'
& $node --version
& $node $npmCli --version
& $node $npmCli ci --include=dev --no-audit --no-fund
& $node $npmCli run dev
```

POSIXでもNodeと`<prefix>/node_modules/npm/bin/npm-cli.js`を明示できます。通常の`npm`や子processが別版を指していないか確認してください。対応するnpmは`devEngines`を検査し、不一致で停止しますが、旧版npmからの誤操作が常に防止されるとは仮定しません。

</details>

## 開発・品質確認・静的生成

| 用途 | コマンド |
|---|---|
| 開発サーバー | `npm run dev` |
| lint | `npm run lint` |
| テスト（単発） | `npm run test -- --run` |
| テスト（watch） | `npm run test:watch` |
| 静的生成 | `npm run generate` |
| 通常のbuild / preview | `npm run build` / `npm run preview` |

typecheck専用のnpm scriptはありません。ローカルのNuxt CLIを使用します。

```powershell
# PowerShell
& ./node_modules/.bin/nuxt.cmd typecheck
```

```sh
# POSIX
./node_modules/.bin/nuxt typecheck
```

静的成果物は`.output/public`です。`NUXT_PUBLIC_SITE_URL`にはgenerate時にHTTPS originを渡します（path・query・hashは不可）。例えばPowerShellでは次のように指定します。

```powershell
$env:NUXT_PUBLIC_SITE_URL = 'https://monsearch.gifumoko.net'
npm run generate
```

未設定でも生成できますが、関連するcanonical・OGPのURLタグは省略されます。生成後に配信環境の値だけを変えてもHTMLは更新されません。robots/sitemapの固定URLが自動で環境別に書き換わるわけではありません。

## 静的成果物のローカル確認

`npm run generate`の後、インストール済みWranglerでPagesのローカル配信を起動します。

```powershell
# PowerShell
& ./node_modules/.bin/wrangler.cmd pages dev .output/public --ip 127.0.0.1 --port 8788
```

```sh
# POSIX
./node_modules/.bin/wrangler pages dev .output/public --ip 127.0.0.1 --port 8788
```

`http://127.0.0.1:8788`で検索・直接アクセス・再読み込み、`/data/cards.json`、画像、[第三者表示](public/third-party-notices.txt)（配信時は`/third-party-notices.txt`）を確認し、`Ctrl+C`で停止します。`nuxt preview`や一般のstatic serverではPagesのheader・routingを同じ条件で検証できるとは限りません。

本番Cloudflare Pages/DNS、Preview/Access、GitHub Actions・CI/CDの整備・本番検証は未完了です。上のorigin指定とローカル配信は本番公開を行いません。

## カードデータの配置・更新・配信

カードデータの生成は**別Repositoryの責務**です。このRepositoryに収集・DB更新・JSON生成のpipelineが実装されているという意味ではありません。

1. 別Repositoryで生成・確認したJSONを`app/utils/mockData/items/cards.json`へ反映します。
2. データ形式・公開対象・検索用項目や選択肢との整合を確認し、テストと静的生成を行います。収録範囲や最新性をファイル名だけで判断しないでください。
3. Nuxtの生成hookが入力JSON全体を`.output/public/data/cards.json`へコピーします。配信物への反映には再generateが必要です。

開発時は同じ入力をdev handlerから`/data/cards.json`へ配信します。ブラウザーは`cache: no-cache`で取得してdocument内で共有し、検索・並べ替え等を実行します。取得失敗時は画面から再試行できます。Pages向けの`public/_headers`にもJSONの`Cache-Control: no-cache`を指定しています。

コピー処理は非表示fieldの削除やフレーバーテキストの自動除去を行いません。JSON全体が取得可能であることを前提に公開内容を確認してください。カード画像・製品画像・フレーバーテキストは掲載対象外です。robotsによる巡回指示はデータ取得を強制遮断する仕組みではありません。

## ライセンス・権利帰属

独自コード・独自文書・権利を保有する独自画像には[MIT License](LICENSE)を適用します。

`Copyright (c) 2026 M916`

次の内容は、独自の編集・整理部分を含めMITの適用対象外です。

- `cards.json`とその配信コピー、カード本文、ルール、Q&A、裁定等。コード・fixture・文書内に含まれる同内容も除外します。
- 別権利者の著作物であるfavicon。
- X・GitHub等の公式ブランドロゴ、第三者の画像・フォント・ライブラリーその他の素材。

「モンスター・コレクション」関連作品の掲載テキスト・各種データおよび名称等の権利は、各権利者に帰属します。MIT Licenseはそれらの利用許諾や商標の使用権を付与しません。掲載範囲に関する運営者の判断は、権利者による利用許諾の確認とは異なります。

第三者のコンポーネントは各ライセンス・利用条件に従います。[第三者表示](public/third-party-notices.txt)に同梱コードの権利表示・ライセンス全文をまとめています。

- 通常のMDIフォント/アイコン：Apache-2.0等の条件。Brand/Logosは一般MDIライセンスと区別します（[Pictogrammers](https://pictogrammers.com/docs/general/license/)）。
- Noto Sans JP：Google Fontsから外部参照。フォントにはSIL OFL 1.1が適用されます（[OFL原文](https://raw.githubusercontent.com/google/fonts/main/ofl/notosansjp/OFL.txt)）。
- X・GitHubの公式SVG：各社のブランド利用条件に従います（[X](https://about.x.com/en/who-we-are/brand-toolkit)、[GitHub](https://brand.github.com/foundations/logo)）。

### faviconの著作権

- 対象：`public/favicon.ico`
- 著作権表示：© Kakeru Mizuno
- ライセンス：MIT License対象外

本画像は、権利者の許諾に基づき、本サイトでの表示および本Repositoryでの公開・配布を行っています。MIT Licenseによる第三者への再利用許諾は付与しません。

## 関連ドキュメント

- [検索URLの仕様](docs/architecture/query_specification.md)
- [検索データの仕様](docs/architecture/query_data_specification.md)

仕様資料には将来設計も含まれます。現在の対応範囲は実装・テストと併せて確認してください。
