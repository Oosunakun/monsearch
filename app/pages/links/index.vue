<script setup lang="ts">
import ContentMaxWidthContainer from '~~/app/components/common/layout/ContentMaxWidthContainer.vue'
import SectionHeader from '~~/app/components/common/layout/SectionHeader.vue'
import SectionCardShell from '~~/app/components/common/layout/SectionCardShell.vue'
import ExternalLinkCard from '~~/app/components/about/ExternalLinkCard.vue'

import {
  mockAboutLinkItems,
} from '~~/app/utils/mockData'

type LinkItem = {
  id: string
  title: string
  subtitle: string
  icon: string
  href: string
}

const linkItems: LinkItem[] = mockAboutLinkItems
</script>

<template>
  <ContentMaxWidthContainer>
    <SectionCardShell>
      <template #header>
        <SectionHeader title="リンク" color="primary" text-class="text-white" />
      </template>
      <v-row
        :no-gutters="false"
        density="comfortable"
        style="row-gap: 10px;"
      >
        <v-col
          v-for="item in linkItems"
          :key="item.id"
          cols="12"
          md="6"
        >
          <ExternalLinkCard
            :title="item.title"
            :subtitle="item.subtitle"
            :icon="item.icon"
            :href="item.href"
          />
        </v-col>
      </v-row>
    </SectionCardShell>
  </ContentMaxWidthContainer>
</template>