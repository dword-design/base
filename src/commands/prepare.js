import commitlintPackageConfig from '@commitlint/cli/package.json'
import { first, keys } from '@dword-design/functions'
import execa from 'execa'
import { exists } from 'fs-extra'
import outputFiles from 'output-files'

import config from '@/src/config'
import configFiles from '@/src/generated-files'

export default async () => {
  await outputFiles(configFiles)
  if (await exists('.git')) {
    await execa.command('husky install')
    await execa('husky', [
      'set',
      '.husky/commit-msg',
      `npx ${commitlintPackageConfig.bin |> keys |> first} --edit "$1"`,
    ])
  }

  return config.prepare()
}
