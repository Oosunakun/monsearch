<script setup lang="ts">
import { useDisplay } from 'vuetify'
import ZebraTableRow from '~~/app/components/atoms/common/ZebraTableRow.vue'

defineProps<{
  restrictionStatus: string
  referenceLabel: string
  name: string
  cardCategoryName: string
  productName: string
  restrictionNote: string
  zebra: boolean
}>()

const { mobile } = useDisplay()
</script>

<template>
  <ZebraTableRow :zebra="zebra">

    <!-- PC表示 -->
    <template v-if="!mobile">
      <td class="px-3 py-2" style="width: 90px;">
        <v-chip v-if="restrictionStatus !== ''"
          size="x-small"
          color="error"
          variant="flat"
          class="restriction-status-chip"
        >
          {{ restrictionStatus }}
        </v-chip>
      </td>
      <td class="px-3 py-2 text-no-wrap" style="width: 300px;">
        <div class="d-flex align-center">
          <div style="width: 70px;" class="flex-shrink-0 d-flex flex-column align-center">
            <v-chip v-if="referenceLabel !== ''"
              size="x-small"
              color="primary"
              variant="flat"
              class="reference-label-chip"
            >
              {{ referenceLabel }}
            </v-chip>
          </div>
          <span class="ml-2 text-no-wrap" style="width: 200px;">
            {{ name }}
          </span>
        </div>
      </td>
      <td></td>
    </template>

    <!-- モバイル表示 -->
    <template v-else>
      <td class="px-3 py-3">
        <div class="d-flex align-center w-100">
          <div class="flex-shrink-0 d-flex flex-column gap-1" style="width: 80px;">
            <v-chip v-if="restrictionStatus"
              size="x-small"
              color="error"
              variant="flat"
              class="restriction-status-chip font-weight-bold px-2 justify-center mb-1"
            >
              {{ restrictionStatus }}
            </v-chip>
            <v-chip v-if="referenceLabel"
              size="x-small"
              color="primary"
              variant="flat"
              class="reference-label-chip"
            >
              {{ referenceLabel }}
            </v-chip>
          </div>

          <div class="ml-2 flex-grow-1">
            <span class="text-subtitle-2 font-weight-bold" style="line-height: 1.2;">
              {{ name }}
            </span>
          </div>
        </div>
      </td>
    </template>
  </ZebraTableRow>
</template>

<style scoped>
.reference-label-chip {
  height: 18px; 
  font-size: 12px;
  font-weight: 700;
  padding: 8px 8px; /* 左右余白を広げて視認性アップ */
  letter-spacing: 0.04em;
  min-width: 80px;
  justify-content: center;
}
.restriction-status-chip {
  height: 18px; 
  font-size: 12px;
  font-weight: 700;
  padding: 8px 8px; /* 左右余白を広げて視認性アップ */
  letter-spacing: 0.04em;
  min-width: 80px;
  justify-content: center;
}
</style>