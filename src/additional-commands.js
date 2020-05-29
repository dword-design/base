import { mapValues } from '@dword-design/functions'
import commit from './commit'
import test from './test'
import config from './config'

export default {
  commit: {
    options: [{ name: '--allow-empty', description: 'Allow empty commits' }],
    handler: commit,
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
  ...(config.commands
    |> mapValues(command =>
      typeof command === 'function' ? { handler: command } : command
    )),
}
