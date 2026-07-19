<script setup lang="ts">
import { useDisplay } from 'vuetify'
import type { ConditionItem } from '~~/app/types/ui/result'

const { mdAndUp } = useDisplay()

defineProps<{
  conditions: ConditionItem[]
}>()

const isOpen = defineModel<boolean>()
</script>

<template>
  <v-dialog
    v-if="mdAndUp"
    v-model="isOpen"
    max-width="500px"
  >
    <v-card>
      <v-card-title class="bg-grey-lighten-3 text-body-2 font-weight-bold py-3">
        現在の検索条件
      </v-card-title>

      <v-card-text class="pa-4 text-body-2">
        <div
          v-for="item in conditions"
          :key="item.label"
          class="mb-2"
        >
          <strong>{{ item.label }}:</strong>
          {{ item.value }}
        </div>
      </v-card-text>

      <v-card-actions class="justify-end border-t pa-2">
        <v-btn
          variant="text"
          size="small"
          @click="isOpen = false"
        >
          閉じる
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-bottom-sheet
    v-else
    v-model="isOpen"
  >
    <v-card rounded="t-xl">
      <v-card-title class="text-center text-caption font-weight-bold pt-4 pb-2 border-b">
        現在の検索条件
      </v-card-title>

      <div class="pa-4 text-caption">
        <div
          v-for="item in conditions"
          :key="item.label"
          class="mb-2"
        >
          <strong>{{ item.label }}:</strong>
          {{ item.value }}
        </div>

        <v-btn
          block
          color="grey-darken-1"
          variant="flat"
          size="small"
          class="mt-4"
          @click="isOpen = false"
        >
          閉じる
        </v-btn>
      </div>
    </v-card>
  </v-bottom-sheet>
</template>