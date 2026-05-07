<script setup lang="ts">
import { useDisplay } from 'vuetify'
import ZebraTableRow from '~~/app/components/atoms/common/ZebraTableRow.vue'

defineProps<{
  shortName: string
  productName: string
  productNote: string
  releaseDate: string
  zebra: boolean
}>()

const { mobile } = useDisplay()
</script>

<template>
  <ZebraTableRow :zebra="zebra">

    <!-- PC表示 -->
    <template v-if="!mobile">
      <td class="px-3 py-2 text-no-wrap" style="width: 300px;">
        <div class="d-flex align-center">
          <div style="width: 55px;" class="flex-shrink-0 d-flex justify-center">
            <v-chip v-if="shortName !== ''"
              size="x-small"
              color="primary"
              variant="flat"
              class="short-name-chip"
            >
              {{ shortName }}
            </v-chip>
          </div>
          <span class="ml-2">
            {{ productName }}
          </span>
        </div>
      </td>
      <td class="px-3 py-2" style="width: 250px;">
        {{ productNote }}
      </td>
      <td class="px-3 py-2 text-no-wrap" style="width: 90px;">
        {{ releaseDate }}
      </td>
      <td></td>
    </template>

    <!-- モバイル表示 -->
    <template v-else>
      <td class="px-3 py-3">
        <div class="d-flex align-center mb-1">
          <div style="width: 55px;" class="flex-shrink-0">
            <v-chip v-if="shortName !== ''"
              size="x-small"
              color="primary"
              variant="flat"
              class="short-name-chip"
            >
              {{ shortName }}
            </v-chip>
          </div>
          <span class="text-caption text-grey-darken-1 font-weight-bold mr-2">
            {{ productName }}
          </span>
        </div>
        <span 
          class="text-caption text-grey-darken-1 font-weight-medium mr-2 text-wrap-normal" style="font-size: 0.7rem;">
          備考：{{ productNote }}
        </span>
      </td>
    </template>
  </ZebraTableRow>
</template>

<style scoped>
.short-name-chip {
  height: 18px; 
  font-size: 12px;
  font-weight: 700;
  padding: 8px 8px; /* 左右余白を広げて視認性アップ */
  letter-spacing: 0.04em;
}
</style>