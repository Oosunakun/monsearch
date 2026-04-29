<script setup lang="ts">
import { UI_COLORS } from '~~/app/utils/constants/colors'

defineProps<{
  isMobile: boolean
}>()

</script>

<template>
  <NuxtLink
    to="/"
    class="d-flex flex-column justify-center align-center px-3 py-1 rounded site-title-link text-decoration-none"
    :class="isMobile ? 'title-mobile' : 'title-pc flex-shrink-0'"
  >
    <h1 class="font-weight-bold header-site-title" :style="{ color: UI_COLORS.HEADING_BROWN }">
      ■ モンさーち！ ■
    </h1>
    <span class="header-site-subtitle text-medium-emphasis text-center">
      ― モンコレTCG検索支援サイト ―
    </span>
  </NuxtLink>
</template>
<style scoped>
.site-title-link {
  transition: background-color 0.2s;
  text-decoration: none;
}
.site-title-link:hover {
  background-color: lightyellow;
  opacity: 0.85;
}
.header-site-title {
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0;
  white-space: nowrap;
}
.header-site-subtitle {
  font-size: 0.7rem;
  margin-top: -5px;
  line-height: '1.1';
  white-space: nowrap;
}

/* タイトル: PC時は左固定 */
.title-pc {
  height: 44px;
  transform: translateY(-2px);
  transform: translateX( 2px);
}

/* タイトル: モバイル時は絶対中央配置 */
.title-mobile {
  position: absolute;
  left: 50%;
  transform: translateX(-50%) translateY(-2px);
  height: 44px;
  pointer-events: auto;
}
</style>