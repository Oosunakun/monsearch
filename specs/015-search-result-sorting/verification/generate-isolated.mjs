import { runCommand } from '@nuxt/cli'
import { resolve } from 'node:path'
import { existsSync } from 'node:fs'

const dir = resolve('.cache/015-sort-generation')
if (existsSync(dir)) throw new Error(`既存出力の保護: ${dir}`)
// npm run generateが呼ぶNuxt CLIと同じgenerate処理。出力とbuildDirのみ隔離。
await runCommand('generate', ['--cwd', process.cwd()], {
  overrides: { buildDir: `${dir}/build`, nitro: { output: { dir: `${dir}/output` } } },
})
