// ~~/app/composables/useHeaderAwareScroll.ts
import { ref, type Ref, type ComponentPublicInstance } from 'vue'
import { LAYOUT_HEADER } from '~~/app/types/ui/layout'

/** ヘッダー直下からさらに空けたい余白(px) */
const SCROLL_MARGIN = 10

/** アコーディオン等、開閉アニメーションが伝播する親コンテナを探す際のセレクタ */
const EXPAND_CONTAINER_SELECTOR = '.v-expansion-panels'

/**
 * テンプレートの :ref にバインドできる値の型(VNodeRefが受け取れる範囲)。
 * Vueコンポーネントのインスタンス、または生のDOM要素、あるいは未マウント時のnull。
 */
export type TemplateRefValue = Element | ComponentPublicInstance | null

export interface ScrollOptions {
  /** trueの場合、画面内に収まっていても強制的にヘッダー直下までスクロールする */
  force?: boolean
  /** ヘッダー高さを個別に上書きしたい場合に指定 (省略時は LAYOUT_HEADER.HEIGHT) */
  headerOffset?: number
}

export interface ExpandScrollOptions extends ScrollOptions {
  /** レイアウト安定判定のデバウンス時間(ms) 省略時150ms */
  stableDelay?: number
}

/**
 * テンプレートref経由で取得した値(DOM要素 or コンポーネントインスタンス)から
 * 実際のHTMLElementを取り出す。
 */
const resolveEl = (target: TemplateRefValue): HTMLElement | null => {
  if (!target) return null
  // コンポーネントインスタンス(v-expansion-panelなど)の場合は $el を辿る
  if ('$el' in target) {
    const el = (target as ComponentPublicInstance).$el
    return el instanceof HTMLElement ? el : null
  }
  return target instanceof HTMLElement ? target : null
}

const scrollToEl = (el: HTMLElement, options?: ScrollOptions): void => {
  const headerOffset = options?.headerOffset ?? LAYOUT_HEADER.HEIGHT
  const rect = el.getBoundingClientRect()

  if (!options?.force && rect.top >= headerOffset) return

  const y = rect.top + window.scrollY - headerOffset - SCROLL_MARGIN

  window.scrollTo({
    top: Math.max(0, y),
    behavior: 'smooth',
  })
}

/**
 * コンテナ要素から、開閉アニメーションが伝播する範囲の親要素を解決する。
 * 見つからない場合はコンテナ自身を返す(フォールバック)。
 */
const resolveObserveTarget = (el: HTMLElement): HTMLElement => {
  return (el.closest(EXPAND_CONTAINER_SELECTOR) as HTMLElement | null) ?? el
}

// ---- 戻り値の型を明示 -------------------------------------------------

export interface UseHeaderAwareScrollReturn {
  targetRef: Ref<TemplateRefValue>
  scrollToTarget: (options?: ScrollOptions) => void
}

export interface UseHeaderAwareExpandScrollReturn {
  containerRef: Ref<TemplateRefValue>
  targetRef: Ref<TemplateRefValue>
  scrollAfterLayoutStable: (options?: ExpandScrollOptions) => void
  cancel: () => void
}

// -----------------------------------------------------------------------

/**
 * 単一要素を対象にした、ヘッダー考慮スクロール。
 * 用途例: パネル/カードの scrollToTop()
 */
export const useHeaderAwareScroll = (): UseHeaderAwareScrollReturn => {
  // 型引数なしでVueに推論させる(= Ref<Element | ComponentPublicInstance | null>)
  const targetRef = ref<TemplateRefValue>(null)

  const scrollToTarget = (options?: ScrollOptions): void => {
    const el = resolveEl(targetRef.value)
    if (!el) return
    scrollToEl(el, options)
  }

  return {
    targetRef,
    scrollToTarget,
  }
}

/**
 * アコーディオン展開など、「コンテナ(開閉アニメーションの親)」と
 * 「スクロール先(タイトル部分)」の2つのrefが必要なケース向け。
 *
 * containerRef には展開パネル自身(v-expansion-panel)を渡せばよく、
 * 内部で `.v-expansion-panels`(兄弟パネルの開閉が伝播する範囲)を
 * closest() で自動解決してから ResizeObserver を張る。
 */
export const useHeaderAwareExpandScroll = (): UseHeaderAwareExpandScrollReturn => {
  const containerRef = ref<TemplateRefValue>(null)
  const targetRef = ref<TemplateRefValue>(null)

  let observer: ResizeObserver | null = null
  let stableTimer: ReturnType<typeof setTimeout> | null = null

  const cancel = (): void => {
    observer?.disconnect()
    observer = null
    if (stableTimer) {
      clearTimeout(stableTimer)
      stableTimer = null
    }
  }

  const scrollAfterLayoutStable = (options?: ExpandScrollOptions): void => {
    const containerEl = resolveEl(containerRef.value)
    const targetEl = resolveEl(targetRef.value)
    if (!containerEl || !targetEl) return

    cancel() // 連打などで前回の監視が残っていたら破棄

    const observeTarget = resolveObserveTarget(containerEl)
    const stableDelay = options?.stableDelay ?? 150

    observer = new ResizeObserver(() => {
      if (stableTimer) clearTimeout(stableTimer)
      stableTimer = setTimeout(() => {
        scrollToEl(targetEl, options)
        cancel()
      }, stableDelay)
    })

    observer.observe(observeTarget)
  }

  return {
    containerRef,
    targetRef,
    scrollAfterLayoutStable,
    cancel,
  }
}