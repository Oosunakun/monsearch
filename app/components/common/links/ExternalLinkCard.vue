<script setup lang="ts">

defineProps<{
  title: string
  subtitle: string
  href: string
  icon?: string  // デフォルトはmdi-web
  iconSrc?: string
  iconSize?: number
}>()
</script>
<template>
  <v-card
    :href="href"
    variant="outlined"
    class="pa-2 h-100"
    target="_blank"
    rel="noopener noreferrer"
  >
    <div class="d-flex align-center justify-space-between">
      <div class="d-flex align-center">
        <span
          v-if="iconSrc"
          class="brand-icon mr-3"
          aria-hidden="true"
        >
          <img
            :src="iconSrc"
            alt=""
            class="brand-icon__image"
            :style="iconSize === undefined ? undefined : {
              maxWidth: `min(100%, ${iconSize}px)`,
              maxHeight: `min(100%, ${iconSize}px)`
            }"
          />
        </span>
        <v-icon
          v-else
          :icon="icon ?? 'mdi-web'"
          class="mr-3"
          size="small"
          color="black"
        />
        <div class="d-flex flex-column">
          <span
            class="text-subtitle-2 font-weight-bold text-accent"
          >
            {{ title }}
          </span>
          <span
            class="text-caption text-grey-darken-1"
            style="font-size: 0.7rem; line-height: 1.2; font-weight: 400; letter-spacing: 0.01em;"
          >
            {{ subtitle }}
          </span>
        </div>

      </div>
      <v-icon
        icon="mdi-open-in-new"
        color="grey"
        size="0.95rem"
      />
    </div>
  </v-card>
</template>

<style scoped>
.brand-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25em;
  flex: 0 0 1em;
  width: 1em;
  height: 1em;
}

.brand-icon__image {
  display: block;
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 100%;
}
</style>
