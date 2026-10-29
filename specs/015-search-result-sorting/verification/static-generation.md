# 静的生成監査

- 実行場所: F:/Projects/monsearch
- コマンド: node specs/015-search-result-sorting/verification/generate-isolated.mjs
- npm run generateと同じ@nuxt/cliのgenerate処理を使用。既存build/output保全のためbuildDirとnitro.output.dirのみAPI経由でoverride。nuxt.config・preset・routes不変。
- 出力: .cache/015-sort-generation/output/public。終了code 0、18 routes（8ページ＋8 payload＋200/404）。
- 警告: useLayout auto-import重複、Vite plugin timings等（generate.log）。
- audit-static.mjs: 終了code 0。8ページと404の存在、正本/公開JSONのbytes 2,283,572・SHA-256 a53a1730a5cc371f44752185baeb9255671da1e63b21c38e2c8b3a3ae05c70ca一致、no-cache維持。
- 公開Worker/server renderer/API snapshotなし。公開の63 JS/HTML/JSONファイルに正本カードIDの出現0、原JSONそのものの埋め込み0。
- import経路: composable→loader/共有runner、loaderは/data/cards.jsonをfetch。対象client実行ファイル群に正本JSON/dataSource importなし。server型importはtype-only。生成物の文字列検査だけに依存していない。
- 根拠の一覧: static-audit.json。自動検証はHuman画面確認を代替しない。
