import {
  filter,
  flatMap,
  join,
  keys,
  map,
  replace,
} from '@dword-design/functions'
import { constantCase } from 'constant-case'
import execa from 'execa'
import findUp from 'find-up'
import os from 'os'
import P from 'path'

import packageConfig from '@/src/package-config'

export default async (pattern, options) => {
  options = { log: true, ...options }

  const volumeName = packageConfig.name |> replace('@', '') |> replace('/', '-')

  const envSchemaPath = findUp.sync('.env.schema.json')

  const envVariableNames =
    (envSchemaPath ? require(envSchemaPath) : {})
    |> keys
    |> map(name => `TEST_${name |> constantCase}`)

  const dockerfilePath = P.resolve(__dirname, 'Dockerfile')

  const userInfo = os.userInfo()
  await execa('docker', [
    'build',
    '--build-arg',
    `user=${userInfo.uid}:${userInfo.gid}`,
    '-f',
    dockerfilePath,
    '-t',
    'dworddesign/testing:latest',
    '.',
  ], options.log ? { stdio: 'inherit' } : { all: true })

  return execa(
    'docker',
    [
      'run',
      '--rm',
      '--tty',
      ...(envVariableNames
        |> filter(name => process.env[name] !== undefined)
        |> flatMap(name => ['--env', `${name}=${process.env[name]}`])),
      '-v',
      `${process.cwd()}:/app`,
      '-v',
      `${volumeName}:/app/node_modules`,
      'dworddesign/testing:latest',
      'bash',
      '-c',
      [
        `yarn --frozen-lockfile && xvfb-run yarn test:raw${
          options.updateSnapshots ? ' --update-snapshots' : ''
        }`,
        ...(pattern ? [`"${pattern}"`] : []),
        ...(options.grep ? [`-g "${options.grep}"`] : []),
      ] |> join(' '),
    ],
    options.log ? { stdio: 'inherit' } : { all: true }
  )
}
