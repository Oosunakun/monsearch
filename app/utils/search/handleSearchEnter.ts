export function handleSearchEnter(event: KeyboardEvent, submit: () => void) {
  if (!(event.target instanceof HTMLInputElement) || event.defaultPrevented || event.repeat) return
  // IME によっては確定時に isComposing が false でも keyCode は 229 になる。
  if (event.isComposing || event.keyCode === 229) return

  event.preventDefault()
  event.stopPropagation()
  submit()
}
