<script setup lang="ts">
import type { CardSearchResultItem } from '~~/server/types/cardSearch'

const props = defineProps<{
  card: CardSearchResultItem
}>()

const restrictionLabel = computed(() => {
  switch (props.card.deck_restriction_count) {
    case 0: return '禁止'
    case 1: return '1枚制限'
    case 2: return '2枚制限'
    default: return null
  }
})
const restrictionColor = computed(() => {
  switch (props.card.deck_restriction_count) {
    case 0: return 'red-accent-4'
    case 1: return 'yellow-darken-4'
    case 2: return 'yellow-darken-4'
    default: return null
  }
})
</script>
<template>
  <div class="header-name-line d-flex flex-column align-start">
    <span
      v-if="card.summoner?.secondary_name"
      class="secondary-name text-outline"
    >
      {{ card.summoner.secondary_name }}
    </span>
    <span class="card-name text-outline">
      {{ card.name }}
    </span>
    <div 
      v-if="restrictionLabel"
      class="header-restriction-line restriction-label-box d-flex flex-wrap ga-1"
      :class="restrictionColor ? `bg-${restrictionColor}` : null"
    >
      <span class="restriction-label">{{ restrictionLabel }}</span>
    </div>
  </div>
</template>

<style scoped>
.header-name-line {
  margin-top: 2px;
}
.secondary-name {
  font-size: 0.65rem;
  font-weight: 500;
  color: #616161;
  letter-spacing: 0.02rem;
  margin-top: 2px;
  margin-bottom: 1px;
  margin-left: 2.5px;
  line-height: 1;
}
.card-name {
  font-size: 1.2rem;
  font-weight: 900;
  color: #212121;
  margin-left: 0px;
  line-height: 1.2;
  white-space: normal;
}
.text-outline {
  text-shadow: 
    /* ── 1. 基本となるシャープな白い輪郭線（少しだけ太さを細くしてギザギザ感を軽減） ── */
    -1px -1px 0 #ffffff,  
     1px -1px 0 #ffffff,
    -1px  1px 0 #ffffff,
     1px  1px 0 #ffffff,
    -1px  0px 0 #ffffff,
     1px  0px 0 #ffffff,
     0px -1px 0 #ffffff,
     0px  1px 0 #ffffff,

    /* ── 2. 💡 追加：ふんわりとした白いぼかし（グロー効果） ── */
    /* ぼかし値を「3px」および「6px」に設定した白い層を重ねることで、滑らかなグラデーションを作ります */
    0px  0px 3px #ffffff,
    0px  0px 6px #ffffff,
    0px  0px 8px #ffffff,

    /* ── 3. 最背面のうっすらとしたドロップシャドウ（既存を維持しつつ、白ぼかしと馴染むように微調整） ── */
    0px  2px 4px rgba(0, 0, 0, 0.18); 
}

.header-restriction-line {
  margin-top: 2px;
  margin-bottom: 2px;
  padding-left: 3px;
  align-items: center;
  display: inline-flex;
}

.restriction-label-box {
  font-size: 0.650rem;
  font-weight: bold;
  padding: 2px 8px;
  border-radius: 4px; /* 直線の硬さを和らげる緩やかな角丸 */
  
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  letter-spacing: 0.05rem;
  height: 1.2rem;
  line-height: 1;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25); /* ほんの微弱なシャドウ */
}
.restriction-label {
  min-width: 2.6rem;
  margin-right: -0.05rem;
  -webkit-text-stroke: 0.6px rgba(0, 0, 0, 0.3);
  paint-order: stroke fill;
}
</style>
