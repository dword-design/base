import commitlintPackageConfig from '@commitlint/cli/package.json'
import { first, keys } from '@dword-design/functions'
import execa from 'execa'
import { exists } from 'fs-extra'
import outputFiles from 'output-files'

export default async function () {
  await outputFiles(this.generatedFiles)
  if (await exists('.git')) {
    await execa.command('husky install')
    await execa('husky', [
      'set',
      '.husky/commit-msg',
      `npx ${commitlintPackageConfig.bin |> keys |> first} --edit "$1"`,
    ])
  }
  await this.config.prepare()
}
