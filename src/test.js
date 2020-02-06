import { spawn } from 'child-process-promise'
import { remove, symlink } from 'fs-extra'
import P from 'path'
import { mapValues, values, promiseAll, replace, filter, join } from '@dword-design/functions'
import workspaceGlob from './workspace-glob'
import config from './config'
import getProjectzReadmeSectionRegex from 'get-projectz-readme-section-regex'
import { readFileSync as safeReadFileSync } from 'safe-readfile'
import isCI from 'is-ci'
import isDocker from 'is-docker'
import isGitpod from 'is-gitpod'

export default async pattern => {
  try {
    await spawn(
      'ajv',
      [
        '-s', require.resolve('./package-json-schema.config'),
        '-d', 'package.json',
        '--errors', 'text',
      ],
      { capture: ['stderr'] },
    )
  } catch ({ stderr }) {
    throw new Error(stderr)
  }
  
  const readmeContent = safeReadFileSync('README.md', 'utf8') ?? ''
  const missingReadmeSections = ['TITLE', 'BADGES', 'DESCRIPTION', 'INSTALL', 'LICENSE']
    |> filter(sectionName => !getProjectzReadmeSectionRegex(sectionName).test(readmeContent))
  if (missingReadmeSections.length > 0) {
    throw new Error(`The README.md file is missing or misses the following sections: ${missingReadmeSections |> join(', ')}`)
  }

  await config.test()
  try {
    await spawn('depcheck', ['--skip-missing', true, '--config', require.resolve('./depcheck.config'), '.'], { capture: ['stdout', 'stderr'] })
  } catch ({ stdout }) {
    throw new Error(stdout)
  }
  const { bin: binEntries = {} } = require(P.resolve('package.json'))
  await binEntries
    |> mapValues((filename, binName) => remove(P.join('node_modules', '.bin', binName))
      .then(() => symlink(
        P.relative(P.join('node_modules', '.bin'), filename |> replace('dist', 'src')),
        P.join('node_modules', '.bin', binName),
      )),
    )
    |> values
    |> promiseAll

  if (workspaceGlob !== undefined) {
    return spawn('wsrun', ['--bin', require.resolve('./run-command.cli'), '-c', 'test'], { stdio: 'inherit' })
  } else {
    if (!config.testInContainer || isCI || isDocker() || await isGitpod()) {
      return spawn(
        'nyc',
        [
          '--reporter', 'lcov',
          '--reporter', 'text',
          '--cwd', process.cwd(),
          '--require', require.resolve('./pretest'),
          'mocha-per-file',
          '--timeout', 80000,
          ...pattern !== undefined ? [pattern] : [],
        ],
        {
          stdio: 'inherit',
          env: {
            ...process.env,
            NODE_ENV: 'test',
            BABEL_CACHE_PATH: P.join(process.cwd(), 'node_modules', '.cache', '@babel', 'register', '.babel.json'),
          },
        },
      )
    } else {
      throw new Error('This project cannot be tested outside of a container. Please consider to test it in a docker container or GitPod.')
    }
  }
}
