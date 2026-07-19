<script setup lang="ts">
import { mockProductHeaders, mockProductSources } from '~~/app/utils/mockData'
import SectionHeader from '~~/app/components/common/layout/SectionHeader.vue'
import ContentMaxWidthContainer from '~~/app/components/common/layout/ContentMaxWidthContainer.vue'
import SectionCardShell from '~~/app/components/common/layout/SectionCardShell.vue'
import ProductTable from '~~/app/components/products/ProductTable.vue'
import type { ProductRow } from '~~/app/components/products/ProductTable.vue'

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
        <SectionHeader title="カードセット" color="primary" text-class="text-white" />
      </template>

      <ProductTable
        :headers="productHeaders"
        :rows="productRows"
      />
    </SectionCardShell>
  </ContentMaxWidthContainer>
</template>