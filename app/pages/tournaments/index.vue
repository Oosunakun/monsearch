<script setup lang="ts">
import ContentMaxWidthContainer from '~~/app/components/common/layout/ContentMaxWidthContainer.vue'
import SectionCardShell from '~~/app/components/common/layout/SectionCardShell.vue'
import SectionHeader from '~~/app/components/common/layout/SectionHeader.vue'
import ExternalLinkCard from '~~/app/components/common/links/ExternalLinkCard.vue'
import {
  TOURNAMENT_CALENDAR_URL,
  mockCalendarExternalLink
} from '~~/app/utils/mockData'
</script>
<template>
  <ContentMaxWidthContainer>
    <SectionCardShell :margin-bottom="false">
      <template #header>
        <SectionHeader title="大会情報" color="primary" text-class="text-white" />
      </template>
      <div class="tournament-content">
        <p class="calendar-credit">制作：<a href="https://twitter.com/kawamanohito">かわまのひと</a> 様</p>
        <div id="tournament-calendar" class="calendar-region">
          <iframe
            :src="TOURNAMENT_CALENDAR_URL"
            title="モンコレスケジュール（Googleカレンダー）"
            referrerpolicy="no-referrer"
            class="calendar-frame"
          ></iframe>
        </div>
        <div>
          <ExternalLinkCard
            :title="mockCalendarExternalLink.title"
            :subtitle="mockCalendarExternalLink.subtitle"
            :href="mockCalendarExternalLink.href"
            :icon-src="mockCalendarExternalLink.iconSrc"
            :icon-size="mockCalendarExternalLink.iconSize"
          />
        </div>
      </div>
    </SectionCardShell>
  </ContentMaxWidthContainer>
</template>
<style scoped>
.tournament-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
  overflow-wrap: anywhere;
}

.calendar-credit {
  margin-top: 0px;
}

.calendar-region {
  min-width: 0;
  width: 100%;
  border: 1px solid #b6cddc;
}

.calendar-frame {
  display: block;
  width: 100%;
  height: 600px;
  border: 0;
}
</style>
