# R24 Human受入れ後の性能課題・Gate例外案

2026-10-31。状態: 性能改善はR24から分離した後続課題。機能受入れ・検証例外はHD-R24-ACCEPTANCEで承認済み。性能コード変更は未承認。

## 確認事実と範囲

Humanはマスターと固定テストの依存解消を機能的に受け入れた。176件の旧Assertion差分解消と1167件全成功の実績を根拠とする。標準Gate/SC-006のPASSは承認されていない。今回Spec/Plan/既存Oracleを変更しない。

Nuxt test-utilsはbeforeAllでsetupNuxtを実行し、mountSuspendedは動的import、cleanupAll、router.replace、NuxtRoot setup、Suspense解決とnextTickを含む。Nuxtアプリの毎回のフル再起動と、wrapperの毎回mountは同じではない。setup/importの集計値をケース本体時間へそのまま加算できない。

ページは7区画と実子を生成し、カテゴリ区画はv-showで残す。最初の2ケースとslot操作では操作/ライフサイクルの前提が異なり、単純にmountを共用できない。JSONLではmountが約1〜5.5秒、他区間は相対的に短いが内部要因は未分離。同期計測の影響あり。

mountSearch経由はafterEachでunmountするが、後半の直接mountケースは同じ配列に登録しない。frameworkのcleanupAllは主にeffectScopeを停止し、全wrapperのunmountと同義ではない。統一する余地はあるが、先頭の失敗原因とする証拠はない。

Vitest既定はisolate:true、Repositoryで無効化指定なし。Nuxt DOM/globalのteardownも存在する。共有Nuxt状態/Mockの直接漏洩は未証明。worker数制限は処理順や資源競合も変える。既定worker実数とホストCPU/メモリは未測定。hookTimeoutは30000ms、問題ケースのtimeoutは5000ms。長い統合ケースの個別予算と、一律の延長は区別する。拡張方針を一般化する根拠はない。

標準run IDに2PIDを観測したが、別watcher/IDE実行か同一プロセスツリーか不明。親PID読取はアクセス拒否。追加負荷の可能性はあるが原因と断定しない。無断でprocess停止/権限変更しない。

## 候補比較

| 候補 | 変更量 | 改善期待 | 保証・リスク |
|---|---|---|---|
| 全wrapperを登録してafterEachでunmount | 小、対象テストのみ | 後半の資源残留を減らす可能性。効果未測定 | 実子/Assertionを保持。Nuxtの自動cleanupとの重複を確認。先頭遅延の解決は保証しない |
| mount内部の段階計測、Human側の重複実行確認 | 診断のみ、小〜中 | 原因に沿った修正を選べる | 同期計測の攪乱/内部API依存に注意。別途実行承認が必要 |
| 明示的worker上限 | 手順変更は小 | 負荷制御可能だが上限2でも失敗実績あり | 保証は維持。所要時間増、単独の解決策ではない |
| isolate解除/アプリやwrapperの共有 | 中〜大 | 初期化削減の可能性 | Mock・hydration・編集保護・順依存を変えるリスク大。非推奨 |
| 実子stub化/ケース削除 | — | — | 保証を縮小するため採用対象外 |
| timeout延長 | 小 | 処理自体は速くならない | 性能回帰の見逃し。現時点では非推奨 |

## 推奨Plan（実装承認待ち）

性能課題をR24機能受入れとは別課題に切り出す。性能改善を実証できる恒久修正は現時点でないため、R24のために大きな変更を加えない。

1. Humanが他のVitest/watch/IDE実行の有無を確認する（存在を決めつけず、無断停止しない）。
2. テスト側の直接mountを既存wrapper管理へ統一する小変更をレビューする。Assertion・実子・fresh mount・hydration前提は保持する。
3. 承認した比較回数/実行条件で変更前後の末尾/先頭時間と全既存保証を検証し、効果不明なら性能修正として採用しない。
4. 必要ならmount内のimport/router/setup/描画を追加計測する。scope、保存方法、内部APIへの一時変更を別途承認する。

今回このPlanは実装せず、計測も追加実行しない。

## Gate例外の文書変更案（適用前Human Review）

承認済みSpecのSC-006をPASSへ書き換えず維持する。正式human-decisionsに新しい受入れ判断を追記し、状態を「R24機能受入れ済み／標準全体Gate未達／Nuxtテスト性能課題を別管理」とする案。

例外の対象は標準全体テストの既知timeoutだけとし、Assertion失敗やlint/typecheck/generate/保全・公開検査の失敗は免除しない。今回のHuman発言は機能受入れの承認であり、T041〜T046の完了条件変更の承認とは解釈しない。

T041はlint/typecheck成功、標準全体は未達。T042〜T044は実施結果に基づき完了可能。T045は「全成功基準を満たして完了」という条件を満たさず未完了、T046も最終状態の確定が残る。正式な例外適用、性能課題の追跡先と責任/再検証条件、T045/T046の閉じ方をHuman Reviewで確定する。元のGate失敗履歴と成功実績を両方保持する。

実行結果は[verification/results.md](verification/results.md)、監査は[accepted-final-audit.json](verification/accepted-final-audit.json)参照。

## 最終引継ぎ（承認反映）

前節のGate例外案は[HD-R24-ACCEPTANCE](human-decisions.md)で限定承認された。原案の未承認表記は提案時の履歴であり、最終判断は同承認を正とする。性能修正は実装しない。

実測: 最新JSONL標準111.97秒/1166成功1失敗、上限2は171.38秒/1166成功1失敗。標準の対応候補PID42064の召喚術師mount4847.65ms＋ready後nextTick221.29ms、上限2のslot mount5039.61ms。全系列で最終Assertion/afterEachまで到達。標準run IDに別PID44232も存在し帰属未確定。同期記録の影響（最大約65.14ms）を含み、因果は未確定。

正本は[JSONL解析](verification/jsonl-timing-analysis.json)と同JSONのfile列が指す生JSONL、[コード復元証拠](verification/jsonl-code-state.json)。計測コードは除去済み。後続では重複実行の有無確認→最小cleanup案の承認→同じ実子/Assertion/入力/timeoutで前後比較、必要時のみmount内部計測。性能と保証維持を両方評価し、改善不明なら採用しない。回数/条件/変更範囲は後続Human承認で定める。担当・期限・issue番号は未指定。
