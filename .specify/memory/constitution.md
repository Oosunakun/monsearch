# monsearch Constitution

## Core Principles

## Principle I. Type Safety

実装は既存のTypeScript strict modeを維持すること。

型安全性を損なう実装（`any` 等）を避け、既存の型定義を活用する。

---

## Principle II. Testability

新たに追加するロジックにはUnit Testを作成する。

テストは実装の振る舞いを検証可能な粒度で作成する。

---

## Principle III. Incremental Change

変更は対象Featureに必要な最小限とする。

既存機能・画面・アーキテクチャに不要な変更やリファクタリングは行わない。

---

## Principle IV. Existing Architecture

新しいFeatureは既存Repositoryの責務分割・ディレクトリ構成・実装方針を尊重する。

同等の責務を持つ既存実装が存在する場合は、それに合わせる。

---

## Principle V. Human Review

仕様・設計に影響する重要な判断は人間レビューを前提とする。

承認済みSpecification・Planから逸脱する場合は、独断で進めず確認を行う。

---

## Additional Constraints

- 初回検証では Spec Kit Core を使用する。
- Coreで不足が確認できるまでは Community Extensions・独自Workflowは導入しない。
- Brownfield Repositoryを前提として検証を行う。

---

## Development Workflow

1. Repository Investigation
2. Specification
3. Clarification
4. Plan
5. Tasks
6. Implementation
7. Verification

---

## Governance

- このConstitutionはプロジェクト全体の開発指針とする。
- Principleの変更は人間レビューを経て実施する。
- バージョンは意味のある変更時に更新する。
- Specification・Plan・Implementationは本Constitutionに従う。

---

**Version**: 0.1.0 | **Ratified**: 2026-08-16 | **Last Amended**: 2026-08-16