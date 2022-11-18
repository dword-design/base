#!/usr/bin/env node

import { mapValues, values } from '@dword-design/functions'
import makeCli from 'make-cli'

import { Base } from '.'
import loadConfig from './load-config'

const run = async () => {
  const config = await loadConfig()

  const base = new Base(config)
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
          ...(config.testInContainer && {
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
          ...(config.commands
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
