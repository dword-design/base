import { mapValues } from '@dword-design/functions'

import config from '@/src/config'

import checkUnknownFiles from './check-unknown-files'
import commit from './commit'
import lint from './lint'
import prepare from './prepare'
import test from './test'
import testDocker from './test-docker'

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
  ...(config.testInContainer && {
    'test:raw': {
      arguments: '[pattern]',
      handler: test,
      options: [
        {
          description: 'Only run tests matching this string or regexp',
          name: '-g, --grep <grep>',
        },
        {
          description: 'Update snapshots',
          name: '-u, --update-snapshots',
        },
      ],
    },
  }),
  test: {
    arguments: '[pattern]',
    handler: config.testInContainer ? testDocker : test,
    options: [
      {
        description: 'Only run tests matching this string or regexp',
        name: '-g, --grep <grep>',
      },
      {
        description: 'Update snapshots',
        name: '-u, --update-snapshots',
      },
    ],
  },
  ...(config.commands
    |> mapValues(command =>
      typeof command === 'function' ? { handler: command } : command
    )),
}
