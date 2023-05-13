import { endent, includes } from '@dword-design/functions'
import Ajv from 'ajv'
import packageName from 'depcheck-package-name'
import { execa } from 'execa'
import fs from 'fs-extra'
import { createRequire } from 'module'
import P from 'path'

import isCI from './is-ci.js'
import packageJsonSchema from './package-json-schema.js'

const _require = createRequire(import.meta.url)

const ajv = new Ajv({ allowUnionTypes: true })

const validatePackageJson = ajv.compile(packageJsonSchema)

export default async function (options) {
  options = { log: process.env.NODE_ENV !== 'test', patterns: [], ...options }
  if (options.patterns.length === 0) {
    if (!validatePackageJson(this.packageConfig)) {
      throw new Error(endent`
        package.json invalid
        ${ajv.errorsText(validatePackageJson.errors)}
      `)
    }
    await this.lint()
    await this.depcheck()
  }

  const runDockerTests =
    !isCI() || !(['win32', 'darwin'] |> includes(process.platform))

  return execa(
    this.packageConfig.type === 'module' ? packageName`c8` : packageName`nyc`,
    [
      '--reporter',
      'lcov',
      '--reporter',
      'text',
      '--cwd',
      process.cwd(),
      '--all',
      '--exclude',
      '**/*.spec.js',
      '--exclude',
      'coverage',
      '--exclude',
      'tmp-*',
      '--exclude',
      'dist',
      'mocha',
      '--reporter',
      _require.resolve(packageName`mocha-spec-reporter-with-file-names`),
      '--ui',
      'exports',
      '--require',
      packageName`@dword-design/pretest`,
      ...((await fs.exists(P.join('global-test-hooks.js')))
        ? ['--require', 'global-test-hooks.js']
        : []),
      '--file',
      _require.resolve(packageName`@dword-design/setup-test`),
      ...(runDockerTests ? [] : ['--ignore', '**/*.usesdocker.spec.js']),
      '--timeout',
      130000,
      ...(options.patterns.length > 0
        ? options.patterns
        : ['{,!(node_modules)/**/}*.spec.js']),
      ...(options.grep ? ['--grep', options.grep] : []),
      ...(process.platform === 'win32' ? ['--exit'] : []),
    ],
    {
      env: {
        NODE_ENV: 'test',
        ...(this.packageConfig.type === 'module' && {
          NODE_OPTIONS: `--require=${packageName`suppress-experimental-warnings`} --require=${packageName`@dword-design/suppress-babel-register-esm-warning`} --experimental-loader=${packageName`babel-register-esm`}`,
        }),
        ...(options.updateSnapshots && { SNAPSHOT_UPDATE: 1 }),
      },
      ...(options.log ? { stdio: 'inherit' } : { all: true }),
    },
  )
}
