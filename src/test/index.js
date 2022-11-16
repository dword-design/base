import { filter, flatMap, includes, join } from '@dword-design/functions'
import packageName from 'depcheck-package-name'
import execa from 'execa'
import getProjectzReadmeSectionRegex from 'get-projectz-readme-section-regex'
import isCI from 'is-ci'
import { readFileSync as safeReadFileSync } from 'safe-readfile'
import stdEnv from 'std-env'

import lint from '@/src/lint'

import depcheck from './depcheck'

export default async (config, pattern, options) => {
  options = { log: !stdEnv.test, ...options }
  if (!pattern) {
    try {
      await execa(
        'ajv',
        [
          '-s',
          require.resolve('@dword-design/package-json-schema'),
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
    await lint(config)
    await depcheck(config)
  }

  const runDockerTests =
    !isCI || !(['win32', 'darwin'] |> includes(process.platform))

  return execa(
    config.package.type === 'module' ? packageName`c8` : packageName`nyc`,
    [
      '--reporter',
      'lcov',
      '--reporter',
      'text',
      '--cwd',
      process.cwd(),
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
      '--require',
      packageName`@dword-design/babel-register`,
      '--require',
      packageName`@dword-design/pretest`,
      '--file',
      require.resolve('@dword-design/setup-test'),
      ...(runDockerTests ? [] : ['--ignore', '**/*.usesdocker.spec.js']),
      '--timeout',
      130000,
      ...(options.grep ? ['--grep', options.grep] : []),
      ...(process.platform === 'win32' ? ['--exit'] : []),
      pattern || '{,!(node_modules)/**/}*.spec.js',
    ],
    {
      env: {
        NODE_ENV: 'test',
        ...(config.package.type === 'module' && {
          NODE_OPTIONS: `--experimental-loader=${packageName`@dword-design/babel-register-esm`}`,
        }),
        ...(options.updateSnapshots && { SNAPSHOT_UPDATE: 1 }),
      },
      ...(options.log ? { stdio: 'inherit' } : { all: true }),
    }
  )
}
