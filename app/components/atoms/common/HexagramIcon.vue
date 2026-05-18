<script setup>
// Propsで回転や反転などのスタイルを受け取れるようにします
defineProps({
  transformStyle: {
    type: String,
    default: 'none'
  }
});
</script>
<template>
  <svg 
    viewBox="0 0 24 24" 
    width="24" 
    height="24" 
    fill="currentColor"
    :style="{ transform: transformStyle }"
    style="margin-top: -2px; width: 90%;"
  >
    <path d="M12,2L15,7.5L21.5,7.5L18.25,13L21.5,18.5L15,18.5L12,24L9,18.5L2.5,18.5L5.75,13L2.5,7.5L9,7.5Z" />
  </svg>
</template>