<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const cardPools = [
  { title: 'オープン', value: 'open' },
  { title: 'ネオスタン', value: 'neo-stand' }
]

const searchTypes = [
  { title: 'カード名', value: 'name' },
  { title: '種族・タイプ', value: 'race-type' },
  { title: 'キーワード', value: 'keyword' }
]

const navItems = [
  { label: 'カードリスト', to: '/cards' },
  { label: '詳細検索', to: '/advanced-search' },
  { label: '使用制限', to: '/usage-limits' },
  { label: 'ルール', to: '/rules' },
  { label: '大会情報', to: '/tournaments' },
  { label: 'About', to: '/about' }
]

const selectedCardPool = ref('open')
const selectedSearchType = ref('name')
const searchText = ref('')

const isNavActive = (path: string) => route.path === path

const runQuickSearch = async () => {
  await router.push({
    path: '/cards',
    query: {
      pool: selectedCardPool.value,
      type: selectedSearchType.value,
      q: searchText.value.trim()
    }
  })
}
</script>

<template>
  <v-app>
    <v-app-bar color="surface" border="b" elevation="0" height="132">
      <v-container class="d-flex flex-column py-4 ga-4" style="max-width: 1360px;">
        <div class="d-flex flex-column flex-lg-row align-lg-center justify-lg-space-between ga-4">
          <div>
            <p class="text-h4 font-weight-bold text-primary mb-1">
              モンさーち！
            </p>
            <p class="text-caption">
              モンコレTCG検索支援サイト
            </p>
          </div>

          <v-form class="d-flex flex-wrap align-center ga-2" @submit.prevent="runQuickSearch">
            <v-select
              v-model="selectedCardPool"
              :items="cardPools"
              item-title="title"
              item-value="value"
              label="カードプール"
              variant="outlined"
              density="comfortable"
              hide-details
              style="min-width: 180px;"
            />
            <v-select
              v-model="selectedSearchType"
              :items="searchTypes"
              item-title="title"
              item-value="value"
              label="検索種別"
              variant="outlined"
              density="comfortable"
              hide-details
              style="min-width: 180px;"
            />
            <v-text-field
              v-model="searchText"
              label="検索ワード"
              placeholder="例: ドラゴン"
              variant="outlined"
              density="comfortable"
              hide-details
              style="min-width: 240px;"
            />
            <v-btn color="primary" size="large" type="submit">
              検索
            </v-btn>
          </v-form>
        </div>
      </v-container>
    </v-app-bar>

    <v-container class="py-3" style="max-width: 1360px;">
      <div class="d-flex flex-wrap ga-2">
        <v-btn
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :color="isNavActive(item.to) ? 'primary' : undefined"
          :variant="isNavActive(item.to) ? 'flat' : 'outlined'"
          class="text-body-2"
        >
          {{ item.label }}
        </v-btn>
      </div>
    </v-container>

    <v-main class="bg-background">
      <v-container class="py-5" style="max-width: 1360px;">
        <slot />
      </v-container>
    </v-main>

    <v-footer class="bg-on-surface text-white py-4">
      <v-container class="d-flex flex-column flex-sm-row justify-space-between ga-2 text-caption" style="max-width: 1360px;">
        <p>
          当サイトの情報は非公式データです。利用は自己責任でお願いします。
        </p>
        <p>
          &copy; {{ new Date().getFullYear() }} Monsearch Archive
        </p>
      </v-container>
    </v-footer>
  </v-app>
</template>