import commit from './commit'
import depgraph from './depgraph'
import prepare from './prepare'
import release from './release'
import test from './test'
import config from './config'
import { mapValues } from '@dword-design/functions'

export default {
  commit: {
    handler: commit,
  },
  depgraph: {
    handler: depgraph,
  },
  prepare: {
    handler: prepare,
  },
  release: {
    handler: release,
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
