<script setup lang="ts">
import { isItemCard } from '~~/types/card';

defineProps<{
  title: string
  subtitle: string
  href: string
  icon?: string  // デフォルトはmdi-web
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
        <v-icon 
          :icon="icon ?? 'mdi-web'"
          class="mr-3"
          size="small"
          color="black"
        />
        <!-- <span class="text-subtitle-2 font-weight-bold text-accent">
            {{ title }}
        </span> -->
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
