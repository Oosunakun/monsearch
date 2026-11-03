# monsearch

Nuxtを使ったカード検索アプリケーションです。

## 開発環境

- Node.js **22.23.4**
- npm **12.2.1**

package.jsonの`packageManager`と`devEngines`でexact版を指定しています。対応するnpmは`install`／`ci`／`run`前に`devEngines`を検査し、不一致ならエラーにします。宣言だけでNodeやnpmをインストールしたり、PATH上のnpmを切り替えたりはしません。

既存のglobal npm 10を更新せず、専用prefixへ配置済みのnpm 12 CLIを直接使用できます。CLIの取得・配置方法は実行環境を確認して決定します。自動bootstrapやCLI wrapperは用意していません。

PowerShellでは、使用するNodeとnpm CLIの絶対パスを変数で指定できます。`$npmPrefix`は自分の環境で配置済みの専用prefixへ置き換えてください。

```powershell
# Repository rootで実行
$node = (Get-Command node.exe -CommandType Application | Select-Object -First 1).Source
$npmPrefix = '<npm12専用prefixの絶対パス>'
$npmCli = Join-Path $npmPrefix 'node_modules/npm/bin/npm-cli.js'

& $node --version
& $node $npmCli --version
# v22.23.4 / 12.2.1であることを確認

# scriptを実行せず、宣言の検査と利用可能なscriptsの一覧表示
& $node $npmCli run
```

LinuxでもNodeと`<prefix>/node_modules/npm/bin/npm-cli.js`を明示して同じCLIを使います。Nodeの版も確認してください。通常の`npm`コマンドは引き続きglobal npm 10を指す可能性があります。プロジェクト操作では選択したnpm 12を明示し、子processがbare `npm`を起動する場合の版混在にも注意してください。npm 10からの誤操作が常に防止されるとは仮定しません。

確認したnpm 10.9.9では、このRepositoryの`npm run`も`EBADDEVENGINES`で停止します。global npmの破損ではなく要求バージョンとの不一致です。`--force`で回避せず、隔離npm 12 CLIを明示してください。

## 依存関係のインストール

正式採用前にWindows／Linuxのclean ci再現とCloudflareのビルド方式確認が必要です。以下はそのGateで承認された新規作業copyに対する実行例です。A1では実行しません。`npm ci`は実行先の既存node_modulesを削除するため、保全対象のPoC caseへ実行しないでください。

```powershell
& $node $npmCli ci --include=dev --no-audit --no-fund
```

package-lock.jsonを使い、buildに必要なdevDependenciesもインストールします。npm 12の標準script制御を維持します。

- 未承認の**依存パッケージ**のinstall scriptは既定でblockされます。block一覧はinstall失敗と区別して確認します。
- rootの`postinstall: nuxt prepare`は依存の承認policyとは別に実行されます。
- `ignore-scripts`／`dangerously-allow-all-scripts`の有効化や、allowScripts追加による回避は行いません。native binary等の動作に必要と判明したscriptだけ、別Reviewの対象にします。
- 既存のuser/global npmrcや環境変数でも挙動は変わります。意図しないscript設定やoptional依存のomitがないか確認し、設定を一括削除・緩和しないでください。

既知のpeer invalidはeslint@9.39.5、cac@7.0.0、commander@10.0.1の3件です。担当Humanによる限定受入れは、採用後30日または次回Nuxt／ESLint関連依存更新Reviewの早い方までに再評価します。npm lsのexit 1は保持し、path・親要求rangeを含む承認済み3件だけを扱います。新規invalid／missingや関連実害はReviewへ戻します。品質PoCの成功は依存整合性の修復や脆弱性解消を意味しません。

## 開発・検証・生成

依存関係の準備後、上記で選択したNode／npm CLIを使います。

```powershell
# 開発サーバー（既定 http://localhost:3000）
& $node $npmCli run dev

& $node $npmCli run lint
& $node $npmCli run test -- --run

# 静的サイト生成（出力: .output/public）
& $node $npmCli run generate

# build／preview用の既存scripts
& $node $npmCli run build
& $node $npmCli run preview
```

CI／Cloudflareでは同じNode/npm exact版を確認してから実行します。環境ごとの配置・cache・自動installの扱いは別途確認し、ローカル手順だけで正式採用・デプロイを承認したものとは扱いません。
