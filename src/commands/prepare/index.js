import { first, keys } from '@dword-design/functions'
import execa from 'execa'
import fs from 'fs-extra'
import { createRequire } from 'module'
import outputFiles from 'output-files'

const _require = createRequire(import.meta.url)

const commitlintPackageConfig = _require('@commitlint/cli/package.json')

export default async function () {
  await outputFiles(this.generatedFiles)
  if (await fs.exists('.git')) {
    await execa.command('husky install')
    await execa('husky', [
      'set',
      '.husky/commit-msg',
      `npx ${commitlintPackageConfig.bin |> keys |> first} --edit "$1"`,
    ])
  }
  await this.config.prepare()
}
