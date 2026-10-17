import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import ResultList from './ResultList.vue'
import ResultItem from './ResultItem.vue'
import { getSourceCards } from '~~/server/utils/cardSearch/dataSource'
import { projectCard } from '~~/server/utils/cardSearch/project'

const mobile = ref(false)
vi.mock('vuetify', () => ({ useDisplay: () => ({ mobile }) }))

describe('ResultListのカードとChipの対応', () => {
  it.each([false, true])('PC/モバイル=%sで順序・ページ相当の差替えに追従する', async isMobile => {
    mobile.value = isMobile
    const source = projectCard(getSourceCards()[0]!.card)!
    const cards = [0, 1, 2, null].map((count, index) => ({
      ...source, card_id: `card-${index}`, name: '同名検証カード', deck_restriction_count: count,
    }))
    const wrapper = mount(ResultList, {
      props: { cards, totalCount: 4, currentPage: 1, totalPages: 2 },
      global: { stubs: {
        ResultDisplaySettings: true, ItemHeaderStat: true, ItemBody: true,
        ItemEffect: true, ItemMeta: true, CardTextureBackground: true,
        VChip: { template: '<span class="v-chip"><slot /></span>' },
        VPagination: true, VDivider: true, VBtn: { template: '<button><slot /></button>' },
      } },
    })
    const check = (expected: typeof cards) => {
      const items = wrapper.findAllComponents(ResultItem)
      expect(items).toHaveLength(expected.length)
      items.forEach((item, index) => {
        const card = expected[index]!
        expect(item.props('card').card_id).toBe(card.card_id)
        expect(item.text()).toContain(card.name)
        const chip = item.find('.restriction-label-box')
        if (card.deck_restriction_count === null) expect(chip.exists()).toBe(false)
        else expect(chip.text()).toBe(card.deck_restriction_count === 0 ? '禁止' : `${card.deck_restriction_count}枚制限`)
      })
    }
    check(cards)
    const reversed = [...cards].reverse()
    await wrapper.setProps({ cards: reversed })
    check(reversed)
    const nextPage = [cards[3]!, cards[0]!]
    await wrapper.setProps({ cards: nextPage })
    check(nextPage)
    wrapper.unmount()
  })
})
