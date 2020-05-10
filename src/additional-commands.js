import commit from './commit'
import depgraph from './depgraph'
import test from './test'
import config from './config'
import { mapValues } from '@dword-design/functions'

export default {
  commit: {
    options: [
      { name: '--allow-empty', description: 'Allow empty commits' },
    ],
    handler: commit,
  },
  depgraph: {
    handler: depgraph,
  },
  test: {
    arguments: '[pattern]',
    options: [
      {
        name: '-g, --grep <grep>',
        description: 'Only run tests matching this string or regexp',
      },
    ],
    handler: test,
  },
  ...config.commands |> mapValues(handler => ({ handler })),
}