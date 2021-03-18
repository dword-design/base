import { flatMap, join, keys, map, filter } from '@dword-design/functions'
import { constantCase } from 'constant-case'
import execa from 'execa'
import findUp from 'find-up'

export default (pattern, options) => {
  options = { log: true, ...options }
  const envSchemaPath = findUp.sync('.env.schema.json')
  const envVariableNames =
    (envSchemaPath ? require(envSchemaPath) : {}) |> keys |> map(constantCase)
  return execa(
    'docker-multirun',
    [
      '--user',
      'root',
      '--tty',
      ...(envVariableNames
        |> filter(name => process.env[name] !== undefined)
        |> flatMap(name => ['--env', `${name}=${process.env[name]}`])),
      '-v',
      `${process.cwd()}:/app`,
      '-v',
      '/app/node_modules',
      'alekzonder/puppeteer:latest',
      'bash',
      '-c',
      [
        `yarn --frozen-lockfile && yarn test:raw${
          options.updateSnapshots ? ' --update-snapshots' : ''
        }`,
        ...(pattern ? [pattern] : []),
        ...(options.grep ? [`-g ${options.grep}`] : []),
      ] |> join(' '),
    ],
    options.log ? { stdio: 'inherit' } : { all: true }
  )
}
