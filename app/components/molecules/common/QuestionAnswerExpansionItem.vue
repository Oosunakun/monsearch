<script setup lang="ts">
import type { QuestionAnswerItem } from '~~/app/types/ui/rules'
import { UI_COLORS } from '~~/app/utils/constants/colors'

const props = defineProps<{ 
  item: QuestionAnswerItem
}>()

const formatText = (text?: string) => {
  return text?.replace(/\\n/g, '\n') ?? ''
}
</script>

<template>
  <v-expansion-panel class="qa-panel">
    <v-expansion-panel-title v-slot="{ expanded }" class="qa-title pa-2">
      <div class="d-flex align-center w-100">
        <div class="flex-grow-1 min-w-0">
          <!-- collapsed -->
          <div
            v-if="!expanded"
            class="qa-question-preview text-body-2"
          >
            <v-icon
              size="16"
              color="primary"
              class="category-icon"
            >
              mdi-tag-outline
            </v-icon>

            {{ item.question }}
          </div>

          <!-- expanded -->
          <div
            v-else
            class="info-area animate-fade-in"
          >
            <div class="category-row">
              <v-icon
                v-if="item.category"
                size="16"
                color="brawn"
                class="category-icon"
              >
                mdi-tag-outline
              </v-icon>

              <span class="custom-category pre-wrap-text">
                {{ item.category || '&nbsp;' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </v-expansion-panel-title>

    <v-expansion-panel-text class="qa-answer-area">
      <div class="ml-n2 pr-n2">
        <!-- related cards -->
        <div
          v-if="item.cards?.length"
          class="qa-related-cards"
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
              class="reference-label-chip"
            >
              {{ card.card_id }}
            </v-chip>

            <span class="qa-card-name">
              {{ card.name }}
            </span>
          </div>

          <v-divider class="my-3" />
        </div>

        <!-- question -->
        <div class="qa-content qa-question-full">
          <span class="font-weight-bold text-primary mr-1">
            Q.
          </span>

          <span class="pre-wrap-text">
            {{ formatText(item.question) }}
          </span>
        </div>

        <v-divider class="my-3" />

        <!-- answer -->
        <div class="qa-content qa-answer-full">
          <span class="font-weight-bold text-accent mr-1">
            A.
          </span>

          <span class="pre-wrap-text">
            {{ formatText(item.answer) }}
          </span>
        </div>

        <v-divider class="my-3" />

        <!-- footer -->
        <div
          v-if="item.post_date"
          class="qa-meta"
        >
          掲載日: {{ item.post_date }}
        </div>

        <div class="qa-meta mt-1">
          出典: {{ item.source_name }}
        </div>
      </div>

    </v-expansion-panel-text>
  </v-expansion-panel>
</template>

<style scoped>
/* =========================================
 * panel
 * ======================================= */

.qa-panel {
  border-radius: 0;
}

.qa-title {
  min-height: 52px !important;
  padding-block: 0 !important;
  transition: background-color 0.3s ease;
}

.v-expansion-panels--variant-accordion
> .v-expansion-panel {
  margin-top: 0 !important;
}

/* zebra */

.v-expansion-panel:nth-child(odd)
> .v-expansion-panel-title {
  background: #fff;
}

.v-expansion-panel:nth-child(even)
> .v-expansion-panel-title {
  background: #f8fbf1;
}

/* active */

.v-expansion-panel--active {
  border: 1px solid v-bind('UI_COLORS.PRIMARY');
}

.v-expansion-panel--active
> .v-expansion-panel-title {
  background: v-bind('UI_COLORS.SECONDARY') !important;
  color: v-bind('UI_COLORS.HEADING_BROWN');
}

.v-expansion-panel--active
> .v-expansion-panel-text {
  background: #fff;
}

/* =========================================
 * preview
 * ======================================= */

.qa-question-preview {
  display: -webkit-box;
  overflow: hidden;
  color: #444;
  -webkit-box-orient: vertical;
  line-clamp: 1;
  -webkit-line-clamp: 1;
}

.category-row {
  display: flex;
  align-items: center;
  min-width: 0;
}

.category-icon {
  flex-shrink: 0;
  margin-right: 4px;
}

.custom-category {
  font-size: 0.85rem;
  font-weight: 700;
  color: v-bind('UI_COLORS.HEADING_BROWN');
  line-height: 1.15;
}

/* =========================================
 * content
 * ======================================= */

.qa-answer-area {
  background: #fafafa;
}

.qa-content {
  line-height: 1.6;
}

.pre-wrap-text {
  white-space: pre-wrap;
  word-break: break-word;
}

/* =========================================
 * related cards
 * ======================================= */

.qa-related-cards {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-block: 8px 12px;
  font-size: 0.8rem;
}

.reference-label-chip {
  min-width: 80px;
  height: 18px;
  padding-inline: 8px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  justify-content: center;
}

.qa-card-name {
  margin-left: 4px;
  font-weight: 700;
}

/* =========================================
 * footer
 * ======================================= */

.qa-meta {
  font-size: 0.75rem;
  color: rgb(var(--v-theme-on-surface), 0.6);
}

/* =========================================
 * animation
 * ======================================= */

.animate-fade-in {
  animation: fadeIn 0.25s ease-out;
}

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