import { endent, flatMap, includes } from '@dword-design/functions'
import packageJsonSchema from '@dword-design/package-json-schema'
import Ajv from 'ajv'
import packageName from 'depcheck-package-name'
import { execa } from 'execa'
import { createRequire } from 'module'
import { isTest } from 'std-env'

import isCI from './is-ci.js'

const _require = createRequire(import.meta.url)

const ajv = new Ajv({ allowUnionTypes: true })

const validatePackageJson = ajv.compile(packageJsonSchema)

export default async function (options) {
  options = { log: !isTest, patterns: [], ...options }
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
      ...(this.config.coverageFileExtensions
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
    }
  )
}
