import execa from 'execa'
import outputFiles from 'output-files'
import { exists } from 'fs-extra'

import config from '@/src/config'
import configFiles from '@/src/generated-files'

export default async () => {
  await outputFiles(configFiles)
  if (await exists('.git')) {
    await execa.command('husky install')
    await execa('husky', [
      'set',
      '.husky/commit-msg',
      'npx commitlint --edit "$1"',
    ])
  }

  return config.prepare()
}
