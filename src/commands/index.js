import { mapValues } from '@dword-design/functions'

import config from '@/src/config'

import checkUnknownFiles from './check-unknown-files'
import commit from './commit'
import lint from './lint'
import prepare from './prepare'
import test from './test'

export default {
  'check-unknown-files': {
    handler: checkUnknownFiles,
  },
  commit: {
    handler: commit,
    options: [{ description: 'Allow empty commits', name: '--allow-empty' }],
  },
  lint: {
    handler: lint,
  },
  prepare: {
    handler: prepare,
  },
  test: {
    arguments: '[pattern]',
    handler: test,
    options: [
      {
        description: 'Only run tests matching this string or regexp',
        name: '-g, --grep <grep>',
      },
    ],
  },
  ...(config.commands
    |> mapValues(command =>
      typeof command === 'function' ? { handler: command } : command
    )),
}
