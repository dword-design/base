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
import fs from 'fs-extra'
import os from 'os'

export default async function (options) {
  options = { log: true, ...options }

  const volumeName =
    this.packageConfig.name |> replace('@', '') |> replace('/', '-')

  const envSchemaPath = findUp.sync('.env.schema.json')

  const envVariableNames =
    (envSchemaPath ? await fs.readJson(envSchemaPath) : {})
    |> keys
    |> map(name => `TEST_${name |> constantCase}`)

  const userInfo = os.userInfo()
  try {
    return await execa(
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
          'yarn --frozen-lockfile',
          '&&',
          'yarn test:raw',
          ...(options.updateSnapshots ? [' --update-snapshots'] : []),
          ...(options.pattern ? [`"${options.pattern}"`] : []),
          ...(options.grep ? [`-g "${options.grep}"`] : []),
        ] |> join(' '),
      ],
      options.log ? { stdio: 'inherit' } : { all: true }
    )
  } finally {
    await execa('docker', [
      'run',
      '--rm',
      '--tty',
      '-v',
      `${process.cwd()}:/app`,
      '-v',
      `${volumeName}:/app/node_modules`,
      'dworddesign/testing:latest',
      'bash',
      '-c',
      `chown -R ${userInfo.uid}:${userInfo.gid} /app`,
    ])
  }
}
