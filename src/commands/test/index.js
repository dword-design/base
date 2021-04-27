import { filter, flatMap, includes, join } from '@dword-design/functions'
import packageName from 'depcheck-package-name'
import execa from 'execa'
import getProjectzReadmeSectionRegex from 'get-projectz-readme-section-regex'
import isCI from 'is-ci'
import { readFileSync as safeReadFileSync } from 'safe-readfile'
import stdEnv from 'std-env'

import lint from '@/src/commands/lint'
import config from '@/src/config'

export default async (pattern, options) => {
  options = { log: !stdEnv.test, ...options }
  if (!pattern) {
    try {
      await execa(
        'ajv',
        [
          '-s',
          require.resolve('./package-json-schema'),
          '-d',
          'package.json',
          '--allow-union-types',
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

  const runDockerTests =
    !isCI || !(['win32', 'darwin'] |> includes(process.platform))

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
      ...(config.coverageFileExtensions
        |> flatMap(extension => ['--extension', extension])),
      '--exclude',
      '**/*.spec.js',
      '--exclude',
      'coverage',
      '--exclude',
      'tmp-*',
      '--exclude',
      'dist',
      'mocha',
      '--ui',
      packageName`mocha-ui-exports-auto-describe`,
      ...(runDockerTests ? [] : ['--ignore', '**/*.usesdocker.spec.js']),
      '--file',
      require.resolve('./setup-test'),
      '--timeout',
      80000,
      ...(options.grep ? ['--grep', options.grep] : []),
      ...(process.platform === 'win32' ? ['--exit'] : []),
      pattern || '{,!(node_modules)/**/}*.spec.js',
    ],
    {
      env: {
        NODE_ENV: 'test',
        ...(options.updateSnapshots && { SNAPSHOT_UPDATE: 1 }),
      },
      ...(options.log ? { stdio: 'inherit' } : { all: true }),
    }
  )
}
