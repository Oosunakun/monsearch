import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'

// 独立oracle: comparatorではなく、group別に数値のbucketを作り、bucketキーを列挙。
// bucket内は正本を走査した収録順を保持。本体sort/runnerはimportしない。
const path = 'app/utils/mockData/items/cards.json'
const bytes = readFileSync(path)
const { cards } = JSON.parse(bytes)
const result = {}
const evidence = {}
for (const key of ['level', 'atk', 'defense', 'initiative']) {
  const groups = [new Map(), new Map(), new Map()]
  for (const [index, card] of cards.entries()) {
    const field = key === 'atk' ? 'attack' : key
    const unit = key === 'initiative' ? card.unit?.ability?.initiative : card.unit?.[field]
    const equip = key === 'level' ? undefined : key === 'initiative' ? card.item?.equip?.ability?.initiative : card.item?.equip?.[field]
    const group = unit != null ? 0 : equip != null ? 1 : 2
    const value = unit ?? equip ?? null
    const bucket = groups[group].get(value) ?? []
    bucket.push({ id: card.card_id, index })
    groups[group].set(value, bucket)
  }
  evidence[key] = groups.map(group => [...group].map(([value, rows]) => ({ value, ids: rows.map(row => row.id) })))
  result[key] = Object.fromEntries(['asc', 'desc'].map(order => [order, groups.flatMap(group => [...group.keys()].sort((a, b) => (a - b) * (order === 'asc' ? 1 : -1)).flatMap(value => group.get(value).map(row => row.id)))]))
}
writeFileSync('specs/015-search-result-sorting/verification/expected-sort-results.json', JSON.stringify(result, null, 2) + '\n')
writeFileSync('specs/015-search-result-sorting/verification/oracle-buckets.json', JSON.stringify(evidence, null, 2) + '\n')
writeFileSync('specs/015-search-result-sorting/verification/oracle-provenance.md', `# 独立期待値の来歴\n\n正本SHA-256: ${createHash('sha256').update(bytes).digest('hex')}\n\ncapture-sort-oracle.mjsは本体をimportせず、正本の対象フィールドをgroup別・数値別bucketに格納し、bucketキーだけを数値順に列挙する。bucket内は収録順。oracle-buckets.jsonで全参照値とgroupの所属IDを確認できる。合成例の期待順は契約表から手書き。旧atk6ケースには全件期待順を旧ID集合で絞って使用する。id/rarityは旧oracleのまま。\n`)
