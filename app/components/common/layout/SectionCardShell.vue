<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    marginBottom?: boolean
    contentClass?: string
    collapsible?: boolean
    initiallyOpen?: boolean
  }>(),
  {
    marginBottom: true,
    contentClass: '',
    collapsible: false,
    initiallyOpen: true
  }
)

// 開閉状態の管理
const isOpen = ref(props.initiallyOpen)

const collapsibleToggle = () => {
  if (props.collapsible) {
    isOpen.value = !isOpen.value
  }
}
</script>

<template>
  <v-card 
    variant="flat"
    color="white"
    :class="[
      { 'mb-4': marginBottom },
      { 'is-collapsible': collapsible }
    ]"
    elevation="1"
  >
    <div 
      class="header-container" 
      :class="{ 'cursor-pointer': collapsible }"
      @click="collapsibleToggle"
    >
      <slot name="header"></slot>

      <div v-if="collapsible" class="collapse-icon-wrapper">
        <v-icon
          size="small"
          :class="{ 'is-rotated': !isOpen }"
          color="white"
          class="collapse-icon"
        >
          mdi-chevron-up
        </v-icon>
      </div>
    </div>
    <v-expand-transition>
      <div v-show="!collapsible || isOpen">
        <v-divider v-if="collapsible && isOpen" />
        <v-card-text :class="[ contentClass ]">
          <slot></slot>
        </v-card-text>
      </div>
    </v-expand-transition>
  </v-card>
</template>
<style scoped>
.header-container {
  position: relative; /* アイコン配置の基準 */
  display: block;
  width: 100%;
}

.cursor-pointer {
  cursor: pointer;
}

.collapse-icon-wrapper {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  display: flex;
  align-items: center;
}

.collapse-icon {
  transition: transform 0.3s ease;
  filter: drop-shadow(0px 1px 2px rgba(0,0,0,0.2));
  opacity: 0.9;
}

.collapse-icon.is-rotated {
  transform: rotate(180deg);
}

:deep(.v-card-text) {
  line-height: 1.4;
  letter-spacing: -0.01em;
  padding: 0.95rem;
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
  font-size: 0.95rem;
}

/* ブラウザデフォルトmarginを明示的にリセット */
:deep(.v-card-text p),
:deep(.v-card-text ul),
:deep(.v-card-text ol) {
  margin-top: 0;
  margin-bottom: 0;
}

:deep(ul) {
  padding-left: 1.3rem; 
  list-style-type: disc;
}
:deep(li) {
  margin-bottom: 2px;
}
:deep(.v-card-text li:last-child) {
  margin-bottom: 0;
}
:deep(li::marker) {
  color: #666;
}
</style>