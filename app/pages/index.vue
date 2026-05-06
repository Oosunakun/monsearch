<script setup lang="ts">
import { mockProductHeaders, mockProductSources } from '~~/app/utils/mockData'
import AppSectionHeader from '~~/app/components/atoms/common/AppSectionHeader.vue'
import ContentMaxWidthContainer from '~~/app/components/atoms/common/ContentMaxWidthContainer.vue'
import SectionCardShell from '~~/app/components/molecules/common/SectionCardShell.vue'
import ProductTable from '~~/app/components/organisms/products/ProductTable.vue'
import type { ProductRow } from '~~/app/components/organisms/products/ProductTable.vue'

const productHeaders = mockProductHeaders
const productSourceRows = mockProductSources

const productRows = computed<ProductRow[]>(() =>
  productSourceRows.map((row, index) => ({
    ...row,
    zebra: index % 2 === 1
  }))
)
</script>

<template>
  <ContentMaxWidthContainer>
    <SectionCardShell>
      <template #header>
        <AppSectionHeader title="カードセット" color="primary" text-class="text-white" />
      </template>

      <ProductTable
        :headers="productHeaders"
        :rows="productRows"
      />
    </SectionCardShell>
  </ContentMaxWidthContainer>
</template>