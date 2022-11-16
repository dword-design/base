#!/usr/bin/env node

import { mapValues, values } from '@dword-design/functions'
import makeCli from 'make-cli'

import checkUnknownFiles from './check-unknown-files'
import commit from './commit'
import config from './config'
import lint from './lint'
import prepare from './prepare'
import test from './test'
import testDocker from './test-docker'

makeCli({
  commands:
    {
      checkUnknownFiles: {
        handler: checkUnknownFiles,
      },
      commit: {
        handler: commit,
        options: [
          { description: 'Allow empty commits', name: '--allow-empty' },
        ],
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
    |> mapValues((command, name) => ({
      ...command,
      handler: async (...args) => {
        try {
          return command.handler(...args) |> await
        } catch (error) {
          console.log(error.message)
          process.exit(1)

          return undefined
        }
      },
      name,
    }))
    |> values,
})
