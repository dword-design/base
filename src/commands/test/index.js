import { filter, join } from '@dword-design/functions'
import { isCI } from '@qawolf/ci-info'
import execa from 'execa'
import getProjectzReadmeSectionRegex from 'get-projectz-readme-section-regex'
import isDocker from 'is-docker'
import isGitpod from 'is-gitpod'
import { readFileSync as safeReadFileSync } from 'safe-readfile'

import lint from '@/src/commands/lint'
import config from '@/src/config'

export default async (pattern, options) => {
  options = { log: true, ...options }
  if (!pattern) {
    try {
      await execa(
        'ajv',
        [
          '-s',
          require.resolve('./package-json-schema'),
          '-d',
          'package.json',
          '--errors',
          'text',
        ],
        { all: true }
      )
    } catch (error) {
      throw new Error(error.all)
    }
    const readmeContent = safeReadFileSync('README.md', 'utf8') || ''
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
    await lint()
    try {
      await execa(
        'depcheck',
        [
          '--skip-missing',
          true,
          '--config',
          require.resolve('./depcheck-config'),
          '.',
        ],
        { all: true }
      )
    } catch (error) {
      throw new Error(error.all)
    }
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
        ...(options.grep ? ['--grep', options.grep] : []),
        ...(process.platform === 'win32' ? ['--exit'] : []),
        pattern || '{,!(node_modules)/**/}*.spec.js',
      ],
      {
        env: { ...process.env, NODE_ENV: 'test' },
        ...(options.log ? { stdio: 'inherit' } : { all: true }),
      }
    )
  }
  throw new Error(
    'This project can only be tested inside of a container. Please consider to test it in a docker container or in GitPod.'
  )
}
