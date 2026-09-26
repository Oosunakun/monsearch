import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    ignores: ['node_modules/**', 'dist/**', 'build/**', 'coverage/**', '*.min.js']
  },
  {
    rules: {
        // コンポーネント名は単一単語でも許可 (AppHeader.vue だけでなく Header.vue もOKにする)
        // 小規模・個人開発では 'off' にしておくとファイル名に悩まなくて済みます
        'vue/multi-word-component-names': 'off',

        // 未使用変数のチェック
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            caughtErrorsIgnorePattern: '^_'
          }
        ],

        // --- HTML/Vue 構文ルール (健全なマークアップのための設定) ---
        'vue/html-self-closing': ['error', {
        html: {
            // br, img, input などの空要素は自己閉じを必須とする (XML/TSX互換)
            void: 'always',
            // div, span, p などの標準HTML要素は自己閉じを「禁止」し、必ず閉じタグを書く
            // ※ HTML5のパースミスを防止し、マークアップの意図を明確にするため
            normal: 'never',
            // Vueコンポーネントは自己閉じを必須とする
            // ※ 標準HTML要素との視覚的な区別を容易にするため
            component: 'always'
        },
        svg: 'always',
        math: 'always'
        }]
    }
  }
)
