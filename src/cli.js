#!/usr/bin/env node

import { mapValues, values } from '@dword-design/functions'
import makeCli from 'make-cli'

import { Base } from './index.js'
import loadConfig from './load-config/index.js'

const run = async () => {
  const base = new Base(await loadConfig())
  try {
    await makeCli({
      commands:
        {
          checkUnknownFiles: {
            handler: () => base.checkUnknownFiles(),
          },
          commit: {
            handler: () => base.commit(),
            options: [
              { description: 'Allow empty commits', name: '--allow-empty' },
            ],
          },
          lint: {
            handler: () => base.lint(),
          },
          prepare: {
            handler: () => base.prepare(),
          },
          ...(base.config.testInContainer && {
            'test:raw': {
              arguments: '[pattern]',
              handler: (pattern, options) =>
                base.testRaw({ pattern, ...options }),
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
            handler: (pattern, options) => base.test({ pattern, ...options }),
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
          ...(base.config.commands
            |> mapValues(command =>
              typeof command === 'function' ? { handler: command } : command
            )),
        }
        |> mapValues((command, name) => ({ name, ...command }))
        |> values,
    })
  } catch (error) {
    console.log(error.message)
    process.exit(1)
  }
}
run()
