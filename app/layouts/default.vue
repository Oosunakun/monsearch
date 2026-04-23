<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const drawer = ref(false)

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
  { label: '詳細検索', to: '/cards/search' },
  { label: '使用制限', to: '/restrictions' },
  { label: 'ルール', to: '/rules' },
  { label: '大会情報', to: '/tournaments' },
  { label: 'About', to: '/about' }
]

const selectedCardPool = ref('open')
const selectedSearchType = ref('name')
const searchText = ref('')

const isNavActive = (path: string) => route.path === path

const moveTo = async (path: string) => {
  drawer.value = false
  await router.push(path)
}

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
    <v-navigation-drawer
      v-model="drawer"
      temporary
      location="left"
      width="280"
    >
      <v-list nav>
        <v-list-item
          v-for="item in navItems"
          :key="item.to"
          :title="item.label"
          :active="isNavActive(item.to)"
          @click="moveTo(item.to)"
        />
      </v-list>
    </v-navigation-drawer>

    <v-app-bar color="surface" border="b" elevation="0" class="header-app-bar">
      <v-container class="py-3" style="max-width: 1360px;">
        <div class="d-flex flex-column flex-lg-row align-lg-center justify-lg-space-between ga-3">
          <div class="d-flex align-center justify-space-between ga-2">
            <div>
              <p class="text-h4 font-weight-bold mb-1 header-site-title">
                モンさーち！
              </p>
              <p class="text-caption">
                モンコレTCG検索支援サイト
              </p>
            </div>
            <v-app-bar-nav-icon class="d-lg-none" @click="drawer = !drawer" />
          </div>

          <v-form class="d-flex flex-wrap align-center ga-2 header-search-form" @submit.prevent="runQuickSearch">
            <v-select
              v-model="selectedCardPool"
              :items="cardPools"
              item-title="title"
              item-value="value"
              variant="outlined"
              density="compact"
              hide-details
              class="layout-search-field"
              aria-label="カードプール選択"
            />
            <v-btn-toggle
              v-model="selectedSearchType"
              mandatory
              divided
              class="search-type-toggle"
            >
              <v-btn
                v-for="type in searchTypes"
                :key="type.value"
                :value="type.value"
                size="small"
                class="text-caption font-weight-bold"
              >
                {{ type.title }}
              </v-btn>
            </v-btn-toggle>
            <v-text-field
              v-model="searchText"
              placeholder="例: ドラゴン"
              variant="outlined"
              density="compact"
              hide-details
              class="layout-search-text"
              aria-label="検索ワード入力"
            />
            <v-btn color="primary" type="submit" class="layout-search-button">
              検索
            </v-btn>
          </v-form>
        </div>

        <v-sheet class="header-nav-wrap d-none d-lg-block" border="b">
          <v-container class="py-2" style="max-width: 1360px;">
            <div class="d-flex flex-wrap ga-2">
              <v-btn
                v-for="item in navItems"
                :key="item.to"
                :to="item.to"
                :color="isNavActive(item.to) ? 'primary' : undefined"
                :variant="isNavActive(item.to) ? 'flat' : 'outlined'"
                class="text-body-2 nav-btn"
                size="small"
              >
                {{ item.label }}
              </v-btn>
            </div>
          </v-container>
        </v-sheet>

      </v-container>
    </v-app-bar>



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

<style scoped>
.layout-search-field {
  min-width: 150px;
  max-width: 180px;
}

.layout-search-text {
  min-width: 190px;
  max-width: 220px;
}

.layout-search-button {
  min-width: 84px;
  height: 40px;
}

.header-site-title {
  color: #3e2723;
  line-height: 1.1;
}

.header-app-bar :deep(.v-toolbar__content) {
  height: auto !important;
  align-items: stretch;
}

.header-search-form :deep(.v-field) {
  border-radius: 6px;
}

.search-type-toggle {
  background: #f2f8e8;
  border-radius: 6px;
  padding: 2px;
}

.search-type-toggle :deep(.v-btn) {
  text-transform: none;
  min-width: 74px;
  color: #3e2723;
}

.search-type-toggle :deep(.v-btn--active) {
  background: rgb(var(--v-theme-primary));
  color: #ffffff;
}

.header-nav-wrap {
  background: #f7f7f7;
}

.nav-btn {
  text-transform: none;
}

@media (max-width: 959px) {
  .header-search-form {
    width: 100%;
  }

  .layout-search-field,
  .layout-search-text {
    min-width: 100%;
    max-width: 100%;
  }

  .search-type-toggle {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .search-type-toggle :deep(.v-btn) {
    width: 100%;
  }
}
</style>