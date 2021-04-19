import { mapValues } from '@dword-design/functions'

import config from '@/src/config.mjs'

import checkUnknownFiles from './check-unknown-files/index.mjs'
import commit from './commit.mjs'
import lint from './lint.mjs'
import prepare from './prepare.mjs'
import test from './test/index.mjs'
import testDocker from './test-docker.mjs'

export default {
  checkUnknownFiles: {
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
