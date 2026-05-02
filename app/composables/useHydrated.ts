export const useHydrated = () => {
  const isMounted = ref(false)
  onMounted(() => { isMounted.value = true })
  return { isMounted }
}