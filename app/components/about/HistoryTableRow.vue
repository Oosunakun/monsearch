<script setup lang="ts">
import { useDisplay } from 'vuetify'
import ZebraTableRow from '~~/app/components/common/layout/ZebraTableRow.vue'

defineProps<{
  date: string
  version: string
  update: string
  zebra: boolean
}>()

const { mobile } = useDisplay()
</script>

<template>
  <ZebraTableRow :zebra="zebra">

    <!-- PC表示 -->
    <template v-if="!mobile">
      <td class="px-3 py-2 text-no-wrap" style="width: 95px;">
        {{ date }}
      </td>
      <td class="px-3 py-2 text-no-wrap" style="width: 100px;">
        <v-chip
            size="x-small"
            color="primary"
            variant="flat"
            class="version-chip"
          >
            {{ version }}
          </v-chip>
      </td>
      <td class="px-3 py-2">
        {{ update }}
      </td>
    </template>

    <!-- モバイル表示 -->
    <template v-else>
      <td class="px-3 py-3">
        <div class="d-flex align-center mb-1">
          <span class="text-caption text-grey-darken-1 font-weight-medium mr-2">
            {{ date }}
          </span>
          <v-chip
            size="x-small"
            color="primary"
            variant="flat"
            class="version-chip"
          >
            {{ version }}
          </v-chip>
        </div>
        <div class="text-body-2 update-text">
          {{ update }}
        </div>
      </td>
    </template>

  </ZebraTableRow>
</template>

<style scoped>
.version-chip {
  height: 18px; 
  font-size: 12px;
  font-weight: 700;
  padding: 8px 8px; /* 左右余白を広げて視認性アップ */
  letter-spacing: 0.04em;
}
.update-text {
  line-height: 1.5;
  white-space: normal;
}
</style>