import { mapValues } from '@dword-design/functions'

import commit from './commit'
import config from './config'
import lint from './lint'
import test from './test'

export default {
  commit: {
    handler: commit,
    options: [{ description: 'Allow empty commits', name: '--allow-empty' }],
  },
  lint: {
    handler: lint,
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
