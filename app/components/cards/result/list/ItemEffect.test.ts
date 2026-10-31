import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import type { CardSearchResultItem } from '~~/server/types/cardSearch'
import { getSourceCards } from '~~/server/utils/cardSearch/dataSource'
import { projectCard } from '~~/server/utils/cardSearch/project'
import ItemEffect from './ItemEffect.vue'
import itemEffectSource from './ItemEffect.vue?raw'

type Effect = CardSearchResultItem['effects'][number]

const textOnlyEffect = (): Effect => ({
  effect_name: '',
  effect_type_name: '',
  effect_activation_type_name: '',
  effect_activation_category_code: '',
  effect_activation_timing_name: '',
  effect_cost_text: '',
  effect_target_name: '',
  effect_text: '※カード効果の補足事項。',
})

const normalEffect: Effect = {
  effect_name: '通常効果',
  effect_type_name: '□完了型特殊能力',
  effect_activation_type_name: '[普通]',
  effect_activation_category_code: 'Battle',
  effect_activation_timing_name: '戦闘中',
  effect_cost_text: '手札1枚',
  effect_target_name: '自軍ユニット1体',
  effect_text: '通常効果の本文。',
}

const render = (effects: Effect[]) => mount(ItemEffect, {
  props: { card: { ...projectCard(getSourceCards()[0]!.card)!, effects } },
})

describe('ItemEffectの本文のみの効果表示', () => {
  it.each([
    textOnlyEffect(),
    // JSON由来のnullを検証する（既存の型定義ではstring）。
    { ...textOnlyEffect(), effect_activation_category_code: null } as unknown as Effect,
  ])('空文字・nullの属性で本文だけを表示する (%j)', effect => {
    const wrapper = render([effect])
    expect(wrapper.text()).toBe(effect.effect_text)
    expect(wrapper.find('.effect-body-line').text()).toBe(effect.effect_text)
    expect(wrapper.find('.effect-line').exists()).toBe(false)
    expect(wrapper.find('.effect-title-group').exists()).toBe(false)
    expect(wrapper.find('.meta-label').exists()).toBe(false)
    expect(wrapper.find('.activation-category-chip').exists()).toBe(false)
    wrapper.unmount()
  })

  it('通常効果の見出し・属性・本文を従来どおり表示する', () => {
    const wrapper = render([normalEffect])
    expect(wrapper.find('.effect-type-prefix').text()).toBe('□')
    expect(wrapper.find('.effect-activation-type').text()).toBe('[普通]')
    expect(wrapper.find('.effect-name').text()).toBe('通常効果')
    expect(wrapper.find('.activation-category-chip').text()).toBe('Battle')
    expect(wrapper.findAll('.meta-label').map(node => node.text())).toEqual(['発揮：', 'コスト：', '対象：'])
    expect(wrapper.find('.timing-chip').text()).toBe('戦闘中')
    expect(wrapper.find('.cost-chip').text()).toBe('手札1枚')
    expect(wrapper.find('.target-chip').text()).toBe('自軍ユニット1体')
    expect(wrapper.find('.effect-body-line').text()).toBe(normalEffect.effect_text)
    wrapper.unmount()
  })

  it('混在する効果を配列順序のまま表示する', () => {
    const effects = [textOnlyEffect(), normalEffect, { ...textOnlyEffect(), effect_text: '末尾の補足。' }]
    const wrapper = render(effects)
    const blocks = wrapper.findAll('.effect-block')
    expect(blocks.map(block => block.find('.effect-body-line').text())).toEqual(effects.map(effect => effect.effect_text))
    expect(blocks.map(block => block.find('.effect-line').exists())).toEqual([false, true, false])
    wrapper.unmount()
  })

  it.each([
    { effects: [textOnlyEffect(), normalEffect], boundaries: [false, false] },
    { effects: [normalEffect, textOnlyEffect()], boundaries: [false, true] },
    { effects: [normalEffect, normalEffect], boundaries: [false, false] },
    { effects: [textOnlyEffect(), textOnlyEffect()], boundaries: [false, true] },
  ])('本文のみの効果に区切りを付ける ($boundaries)', ({ effects, boundaries }) => {
    const wrapper = render(effects)
    expect(wrapper.findAll('.effect-block').map(block => block.classes().includes('effect-kind-boundary'))).toEqual(boundaries)
    wrapper.unmount()
  })

  it.each([normalEffect, textOnlyEffect()])('通常効果・本文のみの効果で改行を保持する (%j)', effect => {
    const effectText = 'ターン終了まで、対象に次の効果を付与する。\n〔この地形の戦闘では、効果を得る。〕'
    const wrapper = render([{ ...effect, effect_text: effectText }])
    expect(wrapper.find('.effect-body-line').element.textContent?.trim()).toBe(effectText)
    wrapper.unmount()
  })

  it('本文の描画クラスに改行表示用CSSを定義する', () => {
    // DOM環境ではブラウザーの実際の改行・折り返しは検証できないため、CSS定義を確認する。
    expect(itemEffectSource).toMatch(/\.effect-body-line\s*\{[^}]*white-space:\s*pre-line;/)
  })
})
