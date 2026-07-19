---
name: Atoms整備計画
overview: "`.vue` 全体の重複装飾・色ハードコード・`scoped` 依存を整理し、見た目を維持したまま Atoms と定数へ段階移行する計画です。優先度順に小さく安全に進め、常にビルド可能状態を維持します。"
todos:
  - id: audit-style-duplicates
    content: 重複装飾・色定義・scoped依存の対象ファイルを確定し優先度を付ける
    status: completed
  - id: add-color-constants
    content: "`app/utils/constants/colors.ts` を導入しコンポーネント内の色ロジックを参照化する"
    status: completed
  - id: extend-existing-atoms
    content: "`SectionHeader`/`ZebraTableRow` の再利用性を拡張し既存画面へ適用する"
    status: completed
  - id: introduce-new-atoms
    content: "`StickyTableHeaderRow`/`SectionCardShell`/`ResultCountLabel`/`ContentMaxWidthContainer` を追加する"
    status: completed
  - id: migrate-pages-organisms
    content: ページ・Organismsの重複クラスとインライン style を Atoms + Vuetify utility へ段階移行する
    status: completed
  - id: verify-each-step
    content: 各ステップで typecheck/build と主要画面の見た目一致確認を実施する
    status: completed
isProject: false
---

# Atoms整備プラン（UI一貫性 + メンテナンス性）

## 目的
- 画面横断で重複している装飾を Atoms 化し、`scoped style` とインライン style を段階的に削減する。
- 色定義を `app/utils/constants/colors.ts` に集約し、表示コンポーネントから色ロジックを分離する。
- 既存デザインは維持し、内部構造のみをクリーン化する。

## 新設する Atoms コンポーネント（候補）
- `app/components/atoms/common/StickyTableHeaderRow.vue`
  - 役割: `sticky + top + z-index + font-weight` を共通化。
  - 想定 props: `theme`（`primary`/`secondary`）、`textColor`（既定維持）。
  - 適用先: 一覧・検索結果・about/rules/restrictions/index のテーブルヘッダ。

- `app/components/atoms/common/SectionCardShell.vue`
  - 役割: `v-card variant="outlined"` + ヘッダ + 本文余白の定型化。
  - 想定 props: `title`, `compact`, `contentClass`。
  - 適用先: 検索フォーム群、規約/制限/about の情報ブロック。

- `app/components/atoms/common/ResultCountLabel.vue`
  - 役割: 件数表示テキスト（色・タイポ・余白）を統一。
  - 適用先: `cards/index`, `cards/search`。

- `app/components/atoms/common/ContentMaxWidthContainer.vue`（必要最小限）
  - 役割: `max-width: 1360px` の重複定義を吸収。
  - 適用先: ヘッダ/フッタ/ナビの固定幅ラッパ。

- 既存拡張: `app/components/atoms/common/ZebraTableRow.vue`
  - 役割追加: ページテーブルにも同じ縞行・hover・境界ルールを適用できる API を補強。

## 色定数化（`app/utils/constants/colors.ts`）
- 新設定数（最小セット）
  - `CARD_ELEMENT_COLORS`（`Fire/Water/...`）
  - `CARD_CATEGORY_COLORS`（`Unit/Spell/...`）
  - `CARD_TIMING_COLORS`（`Battle/Field/...`）
  - `UI_TEXT_COLORS`（例: 見出し茶系 `#3E2723`）
  - `UI_TABLE_COLORS`（zebra/hover/section separator）

- 移行対象（優先）
  - [app/components/CardDetailModal.vue](app/components/CardDetailModal.vue)
  - [app/components/molecules/cards/CardMetaChips.vue](app/components/molecules/cards/CardMetaChips.vue)
  - [app/components/molecules/cards/CardEffectItem.vue](app/components/molecules/cards/CardEffectItem.vue)
  - [app/utils/mockData/search.ts](app/utils/mockData/search.ts)（色名の参照先を定数に寄せる）

## 修正対象ファイル一覧（ページ / Organisms中心）
- ページ
  - [app/pages/index.vue](app/pages/index.vue)
  - [app/pages/cards/index.vue](app/pages/cards/index.vue)
  - [app/pages/cards/search.vue](app/pages/cards/search.vue)
  - [app/pages/about/index.vue](app/pages/about/index.vue)
  - [app/pages/rules/index.vue](app/pages/rules/index.vue)
  - [app/pages/restrictions/index.vue](app/pages/restrictions/index.vue)

- Organisms / 大きめコンポーネント
  - [app/components/organisms/cards/CardListTable.vue](app/components/organisms/cards/CardListTable.vue)
  - [app/components/organisms/cards/CardSearchResultTable.vue](app/components/organisms/cards/CardSearchResultTable.vue)
  - [app/components/organisms/layout/AppHeader.vue](app/components/organisms/layout/AppHeader.vue)
  - [app/components/organisms/layout/AppFooter.vue](app/components/organisms/layout/AppFooter.vue)
  - [app/components/molecules/navigation/NavButtonGroup.vue](app/components/molecules/navigation/NavButtonGroup.vue)
  - [app/components/molecules/search/QuickSearchBar.vue](app/components/molecules/search/QuickSearchBar.vue)

- 既存 Atoms（拡張対象）
  - [app/components/atoms/common/SectionHeader.vue](app/components/atoms/common/SectionHeader.vue)
  - [app/components/atoms/common/ZebraTableRow.vue](app/components/atoms/common/ZebraTableRow.vue)

## 不要になる CSS クラス / インライン style の整理方針
- インライン style の削減
  - `style="color: #3E2723;"` を `ResultCountLabel` または共通テキストクラスへ置換。
  - `style="max-width: 1360px;"` を `ContentMaxWidthContainer` に置換。

- `scoped style` の統合削減
  - 各テーブル個別クラス（`about-table` / `rules-table` / `restriction-table` / `cards-table` / `search-table`）のヘッダ装飾を `StickyTableHeaderRow` に集約。
  - ページごとの縞行/hover 指定を `ZebraTableRow` に寄せる。

- 当面維持（無理に削らない）
  - `:deep` 依存が強い箇所（`QuickSearchBar`, `AppHeader`, `CardDetailModal`）は、まず色定数化と class 名整理だけ先行し、見た目一致を確認後に段階移行。

## 段階的実施ステップ（ビルド通過を維持）
1. **Step 1: 定数基盤作成（非破壊）**
   - `app/utils/constants/colors.ts` 新設。
   - 既存コンポーネント内の color map を import 参照に置換（UI差分なし）。

2. **Step 2: 既存 Atoms の拡張（低リスク）**
   - `ZebraTableRow` を拡張し、既存利用箇所の差分を最小化。
   - `ResultCountLabel` を追加し、`cards/index` と `cards/search` へ先行適用。

3. **Step 3: テーブルヘッダ共通化（中リスク）**
   - `StickyTableHeaderRow` を追加。
   - `CardListTable` / `CardSearchResultTable` → about/rules/restrictions/index の順で適用。

4. **Step 4: レイアウト共通化（低〜中リスク）**
   - `ContentMaxWidthContainer` を導入し、header/footer/nav の `max-width` 重複を置換。

5. **Step 5: `scoped` の最終整理（高リスク領域のみ慎重）**
   - `QuickSearchBar` と `AppHeader` は Vuetify utility で代替可能な部分だけを先に移行。
   - `:deep` や responsive 調整が絡む箇所は visual regression で確認しながら最小単位で実施。

## 検証・品質ゲート（毎ステップ実施）
- 型・ビルド: `nuxi typecheck` / `nuxi build`（または既存 npm scripts）
- 画面確認: 一覧・検索・詳細・about/rules/restrictions の表示比較
- 受け入れ条件
  - 見た目差分なし（色・余白・sticky挙動・hover挙動）
  - 主要ページで `scoped` とインライン style の総量が減少
  - 色定義が `colors.ts` に集約され、重複 map が解消

## 実行順の推奨（効果/工数バランス）
- 先行: `colors.ts` 集約 + `CardDetailModal` / `CardMetaChips` 置換
- 次点: `ResultCountLabel` + `ZebraTableRow` 適用拡大
- その後: `StickyTableHeaderRow` でテーブル群を横断統一
- 最後: `QuickSearchBar` / `AppHeader` の `scoped` 深掘り削減