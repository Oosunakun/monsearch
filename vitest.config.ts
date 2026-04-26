import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    // テストファイルがどこにあるかを指定（例：appディレクトリ内やtestsディレクトリ内）
    include: ['**/*.test.ts'],
  }
})