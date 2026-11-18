export function formatBuildInfo(info: { version: string, commitSha: string, builtAtUtc: string }) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date(info.builtAtUtc))
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find(part => part.type === type)!.value
  return {
    release: `${info.version} (${info.commitSha.slice(0, 7)})`,
    build: `Build: ${value('year')}-${value('month')}-${value('day')} ${value('hour')}:${value('minute')}:${value('second')} JST`,
  }
}
