<script setup lang="ts">
import { computed } from 'vue'

import { UI_COLORS } from '~~/app/utils/constants/colors'
import type { CardRulingItem } from '~~/app/types/ui/rules'
import {
  getRulingTypeColor,
  getRulingTypeLabel,
  normalizeText,
} from '~~/app/utils/ruling'

const props = defineProps<{
  item: CardRulingItem
}>()

const { mobile } = useDisplay()

const cardNamesTitle = computed(() => {
  if (props.item.type === 'text_change') {
    return props.item.category
  }

  return props.item.cards
    ?.slice(0, 1)
    .map(card => `《${card.name}》`)
    .join(' ')
})

const summarySubtitle = computed(() => {
  switch (props.item.type) {
    case 'errata':
      return props.item.revision_reason

    case 'text_change':
      return props.item.subCategory

    case 'text_individual':
      return props.item.notice

    default:
      return ''
  }
})
</script>

<template>
  <v-expansion-panel class="ruling-panel">
    <v-expansion-panel-title v-slot="{ expanded }" class="ruling-title pa-2">
      <div class="d-flex flex-column align-center w-100 overflow-hidden">
        <div 
          class="d-flex align-center ga-1 w-100"
          :class="{ 'animate-fade-in': expanded }">
            <v-chip
              :color="getRulingTypeColor(item.type)"
              density="compact"
              variant="flat"
              class="type-chip font-weight-bold"
            >
              {{ getRulingTypeLabel(item.type, mobile) }}
            </v-chip>
            
            <span class="font-weight-bold card-names-text">
              {{ cardNamesTitle || '&nbsp;'}}
            </span>
          </div>

          <div class="w-100 mt-1">
            <p class="text-caption text-medium-emphasis ruling-summary-text">
              {{ summarySubtitle || '&nbsp;'}}
            </p>
          </div>
      </div>
    </v-expansion-panel-title>

    <v-expansion-panel-text class="ruling-content-area">
      <div class="ml-n3 mr-n3">
        <!-- related cards -->
        <div
          v-if="item.cards?.length"
          class="ruling-related-cards d-flex flex-column ga-1 my-2"
        >
          <div
            v-for="card in item.cards"
            :key="card.card_id"
            class="d-flex align-center text-caption"
          >
            <v-chip
              v-if="card.card_id"
              size="x-small"
              color="primary"
              variant="flat"
              class="reference-label-chip font-weight-bold"
            >
              {{ card.card_id }}
            </v-chip>

            <span class="ruling-card-name ml-1 mb-1 font-weight-bold">
              {{ card.name }}
            </span>
          </div>

          <v-divider v-if="item.type === 'errata'" class="my-3 mb-0 mt-2" />
        </div>

        <div class="mt-1 mb-3">
          <div 
            v-if="item.type === 'errata'"
            class="detail-label text-caption font-weight-bold mb-1 text-primary d-flex align-center"
          >
            <v-icon size="14" class="mr-1">mdi-text-box-check-outline</v-icon>
            修正内容
          </div>
          
          <div class="official-text-box text-body-2 pre-wrap-text pa-2 rounded">
            {{ normalizeText(item.type === 'errata' ? item.errata_text : item.change_text) }}
          </div>
        </div>

        <div v-if="item.type === 'errata' && item.revision_reason" class="mb-3 animate-fade-in">
          <div class="detail-label text-caption font-weight-bold mb-1 text-error d-flex align-center">
            <v-icon size="14" class="mr-1">mdi-comment-question-outline</v-icon>
            修正理由
          </div>
          <div class="pre-wrap-text text-medium-emphasis">
            {{ normalizeText(item.revision_reason) }}
          </div>
        </div>

        <v-divider v-if="item.type === 'errata'" class="my-3" />

        <!-- footer -->
        <div
          v-if="item.type === 'errata' && item.effective_date" 
          class="ruling-meta-effective-date font-weight-bold text-error"
        >
          適用開始日: {{ item.effective_date }}
        </div>
        <div
          v-if="item.post_date"
          class="ruling-meta"
        >
          掲載日: {{ item.post_date }}
        </div>
        <div class="ruling-meta">
          出典: {{ item.source_name }}
        </div>
      </div>
    </v-expansion-panel-text>
  </v-expansion-panel>
</template>

<style scoped>
/* =========================================
 * panel base
 * ======================================= */

.ruling-panel {
  border-radius: 0;
}

.ruling-title {
  min-height: 58px;
  padding-block: 6px;
  font-size: 0.85rem;
  line-height: 1.15;
  transition: background-color 0.3s ease;
}

/* =========================================
 * zebra background
 * ======================================= */

.v-expansion-panel:nth-child(odd)
> .v-expansion-panel-title {
  background-color: #fff;
}

.v-expansion-panel:nth-child(even)
> .v-expansion-panel-title {
  background-color: #f8fbf1;
}

/* =========================================
 * active panel override
 * ======================================= */

.ruling-panel {
  border-radius: 0;
  border: 1px solid transparent;
}

.v-expansion-panel--active {
  border-color: v-bind('UI_COLORS.PRIMARY');
}

.v-expansion-panel--active
> .v-expansion-panel-title {
  background-color: v-bind('UI_COLORS.SECONDARY') !important;
}

.v-expansion-panel--active
> .v-expansion-panel-text {
  background-color: #fff;
}

.v-expansion-panel--active
.card-names-text,
.v-expansion-panel--active
.ruling-summary-text {
  color: v-bind('UI_COLORS.HEADING_BROWN');
}

.v-expansion-panel--active
.ruling-summary-text {
  opacity: 0.9;
}

/* accordion margin reset */

.v-expansion-panels--variant-accordion
> .v-expansion-panel {
  margin-top: 0;
}

/* =========================================
 * title area
 * ======================================= */

.card-names-text {
  font-size: inherit;
  line-height: inherit;
}

:not(.v-expansion-panel--active)
.card-names-text {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.v-expansion-panel--active
.card-names-text {
  white-space: normal;
  word-break: break-word;
}

/* =========================================
 * summary text
 * ======================================= */

.ruling-summary-text {
  display: -webkit-box;
  overflow: hidden;
  font-size: inherit;
  line-height: inherit;
  -webkit-box-orient: vertical;
}

:not(.v-expansion-panel--active)
.ruling-summary-text {
  line-clamp: 1;
  -webkit-line-clamp: 1;
}

.v-expansion-panel--active
.ruling-summary-text {
  line-clamp: 3;
  -webkit-line-clamp: 3;
}

/* =========================================
 * type chip
 * ======================================= */

.type-chip {
  min-width: 40px;
  height: 18px;
  padding-inline: 8px;
  font-size: 12px;
  letter-spacing: 0.04em;
}

.type-chip :deep(.v-chip__content) {
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

/* =========================================
 * content area
 * ======================================= */

.ruling-content-area {
  background-color: #fafafa;
}

.pre-wrap-text {
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 0.85rem;
}


/* =========================================
 * official text
 * ======================================= */

.official-text-box {
  border: 1px solid #e0e0e0;
  background-color: #fcfcfc;
  color: #212121;
  line-height: 1.6;
}

/* =========================================
 * related cards
 * ======================================= */

.ruling-related-cards {
  margin-block: 8px 12px;
  font-size: 0.8rem;
}

.reference-label-chip {
  min-width: 80px;
  height: 18px;
  padding-inline: 8px;
  font-size: 12px;
  letter-spacing: 0.04em;
}

.ruling-card-name {
  margin-bottom: 1px;
}


/* =========================================
 * meta
 * ======================================= */

.ruling-meta {
  margin-bottom: 2px;
  font-size: 0.75rem;
  color: rgb(var(--v-theme-on-surface), 0.6);
}

.ruling-meta-effective-date {
  margin-bottom: 2px;
  font-size: 0.85rem;
}

/* =========================================
 * animation
 * ======================================= */

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-2px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>