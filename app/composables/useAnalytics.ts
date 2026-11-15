import { useNuxtApp } from '#app'
import { noopAnalytics } from '~~/app/utils/analytics/searchTracking'

export const useAnalytics = () => useNuxtApp().$analytics ?? noopAnalytics
