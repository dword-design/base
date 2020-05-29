import execa from 'execa'
import P from 'path'
import { filter, join } from '@dword-design/functions'
import getProjectzReadmeSectionRegex from 'get-projectz-readme-section-regex'
import { readFileSync as safeReadFileSync } from 'safe-readfile'
import { isCI } from '@qawolf/ci-info'
import isDocker from 'is-docker'
import isGitpod from 'is-gitpod'
import config from './config'

export default async (pattern, { grep }) => {
  try {
    await execa(
      'ajv',
      [
        '-s',
        require.resolve('./package-json-schema.config'),
        '-d',
        'package.json',
        '--errors',
        'text',
      ],
      { all: true }
    )
  } catch ({ all }) {
    throw new Error(all)
  }

  const readmeContent = safeReadFileSync('README.md', 'utf8') ?? ''
  const missingReadmeSections =
    ['TITLE', 'BADGES', 'DESCRIPTION', 'INSTALL', 'LICENSE']
    |> filter(
      sectionName =>
        !getProjectzReadmeSectionRegex(sectionName).test(readmeContent)
    )
  if (missingReadmeSections.length > 0) {
    throw new Error(
      `The README.md file is missing or misses the following sections: ${
        missingReadmeSections |> join(', ')
      }`
    )
  }

  await config.test()
  try {
    await execa(
      'depcheck',
      [
        '--skip-missing',
        true,
        '--config',
        require.resolve('./depcheck.config'),
        '.',
      ],
      { all: true }
    )
  } catch ({ all }) {
    throw new Error(all)
  }

  if (!config.testInContainer || isCI || isDocker() || (await isGitpod())) {
    return execa(
      'nyc',
      [
        '--reporter',
        'lcov',
        '--reporter',
        'text',
        '--cwd',
        process.cwd(),
        '--require',
        require.resolve('./pretest'),
        '--all',
        '--include',
        '**/*.js',
        '--exclude',
        '**/*.spec.js',
        '--exclude',
        'coverage/**',
        '--exclude',
        'tmp-*/**',
        '--exclude',
        'dist/**',
        'mocha',
        '--ui',
        'exports-auto-describe',
        '--file',
        require.resolve('./setup-test'),
        '--timeout',
        80000,
        ...(grep !== undefined ? ['--grep', grep] : []),
        ...(process.platform === 'win32' ? ['--exit'] : []),
        ...(pattern !== undefined
          ? [pattern]
          : ['{,!(node_modules)/**/}*.spec.js']),
      ],
      {
        stdio: 'inherit',
        env: {
          ...process.env,
          NODE_ENV: 'test',
          BABEL_CACHE_PATH: P.join(
            process.cwd(),
            'node_modules',
            '.cache',
            '@babel',
            'register',
            '.babel.json'
          ),
        },
      }
    )
  }
  throw new Error(
    'This project can only be tested inside of a container. Please consider to test it in a docker container or in GitPod.'
  )
}