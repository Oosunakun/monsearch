import { defineVitestConfig } from '@nuxt/test-utils/config'
import { configDefaults } from 'vitest/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    // テストファイルがどこにあるかを指定（例：appディレクトリ内やtestsディレクトリ内）
    include: ['**/*.test.ts'],
    // Vitestの既定除外に加え、ローカル備忘・検証資料を除外
    exclude: [
      ...configDefaults.exclude,
      '**/.memo/**',
    ],
    hookTimeout: 30000,
  }
})