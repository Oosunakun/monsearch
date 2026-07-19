<script setup lang="ts">
import type { Card } from '~~/types/cards/finderCards'

defineProps<{
  card: Card
}>()
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
</style>