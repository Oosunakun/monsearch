import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createError } from '#app'
import ErrorPage from './error.vue'

const { clearErrorMock, seoMetaMock } = vi.hoisted(() => ({
  clearErrorMock: vi.fn(),
  seoMetaMock: vi.fn<(input: { title: () => string, robots: string }) => void>()
}))
mockNuxtImport('clearError', () => clearErrorMock)
mockNuxtImport('useSeoMeta', () => seoMetaMock)

describe('共通エラー画面', () => {
  beforeEach(() => {
    clearErrorMock.mockReset()
    seoMetaMock.mockReset()
  })

  it.each([
    { statusCode: 404, title: 'モンさーち！｜404 ページが見つかりません' },
    { statusCode: 500, title: 'モンさーち！｜500 エラーが発生しました' },
    { statusCode: 503, title: 'モンさーち！｜503 エラーが発生しました' }
  ])('status $statusCodeのtitleをサイト名から始める', ({ statusCode, title }) => {
    const wrapper = mount(ErrorPage, { props: { error: createError({ statusCode, message: 'private details' }) } })
    expect(seoMetaMock).toHaveBeenCalledOnce()
    expect(seoMetaMock.mock.lastCall?.[0].title()).toBe(title)
    expect(seoMetaMock.mock.lastCall?.[0].robots).toBe('noindex, follow')
    wrapper.unmount()
  })

  it.each([
    [404, 'ページが見つかりません'],
    [500, 'エラーが発生しました'],
    [503, 'エラーが発生しました']
  ])('status %iを保持し、安全な案内を表示する', (statusCode, heading) => {
    const wrapper = mount(ErrorPage, { props: { error: createError({
      statusCode: Number(statusCode),
      statusMessage: 'private-path',
      message: 'secret exception details',
      stack: 'private stack trace'
    }) } })
    expect(wrapper.get('h1').text()).toBe(heading)
    expect(wrapper.get('.error-status').text()).toBe(String(statusCode))
    expect(wrapper.text()).not.toMatch(/private|secret|stack/)
    expect(wrapper.get('a').attributes('href')).toBe('/')
    wrapper.unmount()
  })

  it('トップリンクでNuxtのエラー状態を解除して復帰する', async () => {
    const wrapper = mount(ErrorPage, { props: { error: createError({ statusCode: 404, message: 'missing' }) } })
    await wrapper.get('a').trigger('click')
    expect(clearErrorMock).toHaveBeenCalledExactlyOnceWith({ redirect: '/' })
    wrapper.unmount()
  })
})
