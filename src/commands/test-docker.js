import { join } from '@dword-design/functions'
import execa from 'execa'

export default (pattern, options) => {
  options = { log: true, ...options }
  return execa(
    'docker-multirun',
    [
      '--user',
      'root',
      '--tty',
      '-v',
      `${process.cwd()}:/app`,
      '-v',
      '/app/node_modules',
      'alekzonder/puppeteer:latest',
      'bash',
      '-c',
      [
        `yarn --frozen-lockfile && yarn test:raw${
          options.updateSnapshots ? ' --snapshot-update' : ''
        }`,
        ...(pattern ? [pattern] : []),
        ...(options.grep ? [`-g ${options.grep}`] : []),
      ] |> join(' '),
    ],
    options.log ? { stdio: 'inherit' } : { all: true }
  )
}
