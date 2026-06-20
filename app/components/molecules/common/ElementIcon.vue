<script setup lang="ts">
import CircleIconBase from '~~/app/components/atoms/common/CircleIconBase.vue'

const props = withDefaults(
  defineProps<{
    text: string
    baseColor: string
    size?: number
  }>(),
  {
    size: 36,
  }
)

const ELEMENT_COLOR_SHIFTS: CircleColorShifts = {
  start: {
    hue: 0,
    saturation: 10,
    lightness: -5,
  },

  middle: {
    hue: 0,
    saturation: 0,
    lightness: 5,
  },

  end: {
    hue: 0,
    saturation: -10,
    lightness: -20,
  },

  stroke: {
    hue: 0,
    saturation: -20,
    lightness: -25,
  },

  shadow: {
    hue: 0,
    saturation: -30,
    lightness: -35,
  },
}

</script>
<template>
  <div
    class="icon"
    :style="{
      width: `${size}px`,
      height: `${size}px`
    }"
  >
    <CircleIconBase class="base" :base-color="baseColor" :color-shifts="ELEMENT_COLOR_SHIFTS" />
      <div class="text text-outline">
        {{ text }}
      </div>
  </div>
</template>
<style scoped>
.icon{
  position:relative;
  width:64px;
  height:64px;
  padding: 0%;
  margin: 0%;
}
.base,
.text{
    position:absolute;
    inset:0;
}
.text {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.9rem;
  font-weight: 500;
  pointer-events: none;
  transform: translateX(-0.5px) translateY(-0.5px);
}

.text-outline {
  text-shadow: 
    /* ── 1. 基本となるシャープな白い輪郭線（少しだけ太さを細くしてギザギザ感を軽減） ── */
    -1px -1px 0 #ffffffA0,  
     1px -1px 0 #ffffffA0,
    -1px  1px 0 #ffffffA0,
     1px  1px 0 #ffffffA0,
    -1px  0px 0 #ffffffA0,
     1px  0px 0 #ffffffA0,
     0px -1px 0 #ffffffA0,
     0px  1px 0 #ffffffA0,

    /* ── 2. 💡 追加：ふんわりとした白いぼかし（グロー効果） ── */
    /* ぼかし値を「3px」および「6px」に設定した白い層を重ねることで、滑らかなグラデーションを作ります */
    0px  0px 3px #ffffffA0,
    0px  0px 6px #ffffffA0,
    0px  0px 8px #ffffffA0,

    /* ── 3. 最背面のうっすらとしたドロップシャドウ（既存を維持しつつ、白ぼかしと馴染むように微調整） ── */
    0px  2px 4px rgba(0, 0, 0, 0.18); 
}
</style>