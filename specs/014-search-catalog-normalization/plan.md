# 実装計画: Search Catalog Normalization

**Branch**: `feature/search-catalog-normalization` | **Date**: 2026-10-25 | **Spec**: [spec.md](spec.md)

**Input**: spec.md、[覚書](../../docs/architecture/query_search_normalization_memo.md) H1〜H10、受領済みcards.json。

**状態**: Phase 0調査・Phase 1設計の資料。実装は仕様・PlanのHuman Review承認後に行う。

## 概要

kwをsearch_support.full_text、attをsearch_support.archetype_textだけのliteral部分一致へ切り替える。cards.jsonを入力の正本とし、対象は提供時点でN₀適用済みの文字列とする。表示情報の再連結・対象の再正規化を廃止し、有効な各検索語をカード走査前に一度だけ変換する。

N₀は限定幅変換＋ASCII小文字化で、カナ合成を行わない。etxのnormalizeQdsText、nm / rlのtextIncludes、is_tokenと既存Token分類、他条件・入力・URL・表示原文・結果処理を維持する。正式QDSとの暫定差異を覚書に従って扱い、意味論を上書きしない。

## 技術コンテキスト

**Language/Version**: TypeScript strict、Nuxt ^4.4.2、Vue ^3.5.40。

**Primary Dependencies**: 既存Nuxt/Nitro・Vue Router。追加package・依存更新なし。

**Storage**: cards.json静的import。482件、full_text・archetype_textのstring型・N₀固定点は事前検証PASS。

**Testing**: Vitest、既存Unit Test・h3 API Test・フォーム／検索ページの既存回帰テスト。固定vector・固定期待カードID集合・受領JSONの確認に加え、通常のlint・typecheck・buildを行い、Repository内で完結する。

**Target Platform**: 既存Nuxt SSR構成を維持。プラットフォームの定量性能測定を完了条件にしない。

**Performance Goals**: 対象全文生成・再正規化ゼロ、有効な各queryのN₀は走査前に1回。構造を自動検証する。

**Constraints**: 入力補修・fallbackなし。提供工程への作業依存なし。既存Effect正規化・Token分類は変更しない。

**Scale/Scope**: 型、server側N₀、matcher準備、API接続、関連Unit/API回帰のみ。UI追加・cache・索引・新しいデータ基盤は含めない。

## Constitution Check

| 原則 | 設計上の確認 | 結果 |
|---|---|---|
| I. Type Safety | strict維持。欠測を明示する型と正常入力契約を区別し、anyを導入しない | PASS |
| II. Testability | 純粋N₀・固定期待値・独立ID集合・呼出構造を自動検証 | PASS |
| III. Incremental Change | catalog切替とquery準備に限定。既存Effect正規化を改修しない | PASS |
| IV. Existing Architecture | server/utils/cardSearch・共有カード型・既存h3 handlerを使用 | PASS |
| V. Human Review | 仕様・PlanのHuman Review承認前に実装せず、承認された範囲で進める | PASS |
| Additional Constraints | 既存Spec Kit Coreの手順と成果物を利用し、追加Workflowを導入しない | PASS |

これは設計資料の静的確認で、実装・自動テストの成功を意味しない。設計上の未決事項・憲章例外はない。

## プロジェクト構成

```text
specs/014-search-catalog-normalization/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── catalog-search.md
│   └── acceptance-evidence.md
└── checklists/requirements.md
```

tasks.mdは、承認済みの仕様・Planに基づく後続のタスク工程で扱う。

実装時の対象:

```text
types/cards/finderCards.ts
server/utils/cardSearch/
├── normalizeCatalogText.ts                # N₀のみ
├── normalizeCatalogText.test.ts           # 全対応文字・境界・冪等性
├── normalizeCatalogText.fixtures.json     # Repository内の固定期待vector
├── search.ts                             # matcher準備とcatalog照合
└── search.test.ts                         # 新契約・既存回帰・呼出構造
server/api/cards.get.ts                    # 一度準備したmatcherを使用
server/api/cards.get.test.ts               # 固定期待ID集合・API回帰
app/utils/search/                          # 既存Parser/BuilderのUnit回帰
```

dataSource.ts、sort.ts、paginate.ts、project.ts、cards.jsonは原則変更不要で確認対象。search_support.is_tokenの型・値・分類処理を変えない。verification/は実装工程でRepository内の自動検証結果を残す場所とする。

## Phase 0: 調査結果

[research.md](research.md)に既存対象との差、N₀分離、query準備、入力契約、固定oracle、構造要件を記録する。両catalogは受領済みであり、提供工程の証跡待ちを前提にしない。

文書のbranch表記とFeature識別子は維持する。実行時は承認されたWorkflowの手順に従う。

## Phase 1: 設計

1. SearchSupport.full_textとarchetype_textをoptionalかつnullableな文字列として定義する。正常提供値はN₀済みstringであり、欠測境界を扱う型とは区別する。公開DTOへ追加しない。
2. normalizeCatalogText(value: string): stringを独立実装する。指定幅変換後にASCII小文字化し、trim・カナ合成を行わない。既存normalizeQdsText等は変更しない。
3. createCardSearchMatcher(criteria)で有効なkeyword・archetypeTextを各一度だけ変換してclosureへ保持する。返すpredicateは対象へ直接includesし、既存他条件へ接続する。
4. matchesCardSearchは単一カード用互換wrapperとして維持。searchCardsとAPIはfactoryを一回呼び、filter内でwrapperを呼び直さない。sourceIndexと既存filter→sort→paginate→projectを維持する。
5. keywordVisibleText / archetypeVisibleTextを廃止する。normalizeQdsText・normalizeEffectText・composeKanaMarks・textIncludes、is_token判定とEffect条件は維持する。
6. 旧catalog無視テストを新契約へ置換し、固定ID集合・欠測・literal・非同一視・原文不変・既存条件併用・N₀呼出構造を検証する。

詳細は[data-model.md](data-model.md)、[検索契約](contracts/catalog-search.md)、[受入契約](contracts/acceptance-evidence.md)、[検証手順](quickstart.md)を参照する。

## 実装・受入の順序とGate

以下は仕様・PlanのHuman Review承認を前提とする実装・受入手順である。

| 順序 | 内容 | 完了条件 |
|---|---|---|
| 1 | 仕様・PlanのHuman Review | 承認後、承認された範囲で実装・検証へ進む |
| 2 | Repository内の入力・既存回帰baselineを確認 | G1の入力確認、既存失敗と新規差分の識別 |
| 3 | N₀と固定vector | SC-001の期待変換・境界・冪等性 |
| 4 | catalog切替・matcher準備・自動回帰 | SC-002/003のID集合・既存挙動 |
| 5 | 性能に関する構造の自動確認 | SC-004のquery各1回、全文生成・再正規化ゼロ |
| 6 | 実装結果を報告 | G1〜G4・SC-001〜004と既存失敗／新規差分を区別 |

機能・構造の完了条件はRepository内の入力確認・Unit Test・API Testで確認する。既存フォーム／検索ページの回帰テストと、lint・typecheck・buildも通常の品質検証として[quickstart.md](quickstart.md)に従って行う。CPU反復測定・中央値改善、実機測定、ブラウザー速度、人間による実動作確認は不要で、その未実施を実装未完了の理由にしない。これらを測定済みとも記録しない。構造上の改善から実行環境の性能適合や公開可否を保証しない。

## Complexity Tracking

憲章例外なし。追加依存、新endpoint、新たな永続モデルは不要。提供工程の監査・作業は含めない。
