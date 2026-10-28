// ローカルCLIの実行結果を保存する。依存取得や環境設定の変更はしない。
import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, delimiter } from 'node:path'

const [label, script, ...args] = process.argv.slice(2)
if (!label || !script || !/^[a-z0-9-]+$/.test(label)) throw new Error('labelとローカルCLIのpathが必要')
const directory = resolve('specs/014-search-catalog-normalization/verification')
const command = ['node', script, ...args].map(arg => /\s/.test(arg) ? JSON.stringify(arg) : arg).join(' ')
const startedAt = new Date().toISOString()
const result = spawnSync(process.execPath, [script, ...args], {
  cwd: process.cwd(), encoding: 'utf8', maxBuffer: 32 * 1024 * 1024,
  env: { ...process.env, PATH: `${resolve('node_modules/.bin')}${delimiter}${process.env.PATH}` },
})
const output = `${result.stdout ?? ''}\n${result.stderr ?? ''}`
const record = { label, command, startedAt, finishedAt: new Date().toISOString(), exitCode: result.status,
  signal: result.signal, error: result.error?.message, output: `${label}.txt` }
writeFileSync(resolve(directory, `${label}.txt`), `${command}\nexit code: ${result.status}\n${output}`)
writeFileSync(resolve(directory, `${label}.log`), `${command}\nexit code: ${result.status}\n${output}`)
const recordsPath = resolve(directory, 'check-results.json')
let records = []
try { records = JSON.parse(readFileSync(recordsPath, 'utf8')) } catch (error) { if (error.code !== 'ENOENT') throw error }
records.push(record)
writeFileSync(recordsPath, JSON.stringify(records, null, 2) + '\n')
console.log(JSON.stringify(record))
console.log(output.slice(-3500))
process.exitCode = result.status ?? 1
