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
          depcheck: {
            handler: () => base.depcheck(),
          },
          lint: {
            handler: () => base.lint(),
          },
          prepare: {
            handler: () => base.prepare(),
          },
          ...(base.config.testInContainer && {
            'test:raw': {
              arguments: '[patterns...]',
              handler: (patterns, options) =>
                base.testRaw({ patterns, ...options }),
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
            arguments: '[patterns...]',
            handler: (patterns, options) => base.test({ patterns, ...options }),
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
          ...base.config.commands |> mapValues(command => (...args) => command.call(base, ...args)),
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
