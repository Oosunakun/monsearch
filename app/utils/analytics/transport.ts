import type { AnalyticsPolicy, AnalyticsTransport, PageContext } from '~~/app/types/analytics'

type Command = unknown[]
type TagWindow = Window & { dataLayer?: IArguments[], gtag?: (...args: unknown[]) => void }

export function createGtagTransport(id: string, policy: AnalyticsPolicy, win: Window, doc: Document) {
  let loaded = false
  let failed = false
  let started = false
  let queue: Command[] = []
  let timer: ReturnType<typeof setTimeout> | undefined
  let latest: PageContext | undefined
  const target = win as TagWindow
  const fail = () => { failed = true; queue = []; if (timer) clearTimeout(timer) }
  const send = (command: Command) => {
    if (failed || !policy.canSend()) { queue = []; return }
    if (!loaded) { if (queue.length < 50) queue.push(command); return }
    try { target.gtag?.(...command) } catch { fail() }
  }
  const transport: AnalyticsTransport = {
    context(context) {
      latest = context
      if (started) send(['set', { ...context }])
    },
    event(name, params) { send(['event', name, { ...params, send_to: id }]) },
  }
  return {
    ...transport,
    start() {
      if (started || !policy.canLoad() || !latest) return
      started = true
      try {
        target.dataLayer = target.dataLayer ?? []
        // Google tagの公式queue形式（Arguments object）を保持する。
        // eslint-disable-next-line prefer-rest-params
        target.gtag = function () { target.dataLayer!.push(arguments) }
        const initial = { ...latest }
        const script = doc.createElement('script')
        script.async = true
        script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`
        script.onerror = fail
        script.onload = () => {
          if (failed || !policy.canSend()) { fail(); return }
          try {
            // timeout後の遅延loadではconfig自体を送らない。
            target.gtag!('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' })
            target.gtag!('js', new Date())
            target.gtag!('config', id, {
              ...initial, send_page_view: false, allow_google_signals: false,
              allow_ad_personalization_signals: false,
            })
            loaded = true
            if (timer) clearTimeout(timer)
            const commands = queue; queue = []
            for (const command of commands) send(command)
          } catch { fail() }
        }
        timer = setTimeout(fail, 30000)
        doc.head.appendChild(script)
      } catch { fail() }
    },
    dispose: fail,
  }
}
