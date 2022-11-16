#!/usr/bin/env node

import { mapValues, values } from '@dword-design/functions'
import makeCli from 'make-cli'

import checkUnknownFiles from './check-unknown-files'
import commit from './commit'
import getConfig from './get-config'
import lint from './lint'
import prepare from './prepare'
import test from './test'
import testDocker from './test-docker'

const run = async () => {
  const config = await getConfig()
  try {
    await makeCli({
      commands: {
        checkUnknownFiles: {
          handler: () => checkUnknownFiles(config),
        },
        commit: {
          handler: commit,
          options: [
            { description: 'Allow empty commits', name: '--allow-empty' },
          ],
        },
        lint: {
          handler: () => lint(config),
        },
        prepare: {
          handler: () => prepare(config),
        },
        ...(config.testInContainer && {
          'test:raw': {
            arguments: '[pattern]',
            handler: (...args) => test(config, ...args),
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
          handler: () => (config.testInContainer ? testDocker : test)(config),
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
    })
  } catch (error) {
    console.log(error.message)
    process.exit(1)
  }
}

run()