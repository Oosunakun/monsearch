<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    preset?: 'table-rows' | 'card-detail' | 'chips' | 'app-bar'
    type?: string | string[]
    loading?: boolean
    height?: number | string
    minHeight?: number | string
  }>(),
  {
    preset: 'table-rows',
    type: undefined,
    loading: true,
    height: undefined,
    minHeight: undefined
  }
)

const resolvedType = computed<string | string[]>(() => {
  if (props.type) {
    return props.type
  }

  if (props.preset === 'card-detail') {
    return ['image', 'chip@3', 'heading', 'paragraph', 'paragraph', 'paragraph']
  }
  if (props.preset === 'chips') {
    return 'chip@6'
  }
  // タイトル＋検索バー相当
  if (props.preset === 'app-bar') {
    return 'text'
  }
  return 'table-tbody@10'
})

const containerStyle = computed<Record<string, string>>(() => {
  const style: Record<string, string> = {}

  if (props.height !== undefined) {
    style.height = typeof props.height === 'number' ? `${props.height}px` : props.height
  }

  if (props.minHeight !== undefined) {
    style.minHeight = typeof props.minHeight === 'number' ? `${props.minHeight}px` : props.minHeight
  }

  return style
})
</script>

<template>
  <div :style="containerStyle">
    <v-skeleton-loader
      :loading="loading"
      :type="resolvedType"
      class="pa-3"
      boilerplate
    />
  </div>
</template>
