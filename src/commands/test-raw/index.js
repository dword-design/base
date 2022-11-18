import { endent, flatMap, includes } from '@dword-design/functions'
import packageJsonSchema from '@dword-design/package-json-schema'
import Ajv from 'ajv'
import packageName from 'depcheck-package-name'
import execa from 'execa'
import stdEnv from 'std-env'

import isCI from './is-ci'

const ajv = new Ajv({ allowUnionTypes: true })

const validatePackageJson = ajv.compile(packageJsonSchema)

export default async function (options) {
  options = { log: !stdEnv.test, ...options }
  if (!options.pattern) {
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
      require.resolve('@dword-design/setup-test'),
      ...(runDockerTests ? [] : ['--ignore', '**/*.usesdocker.spec.js']),
      '--timeout',
      130000,
      ...(options.grep ? ['--grep', options.grep] : []),
      ...(process.platform === 'win32' ? ['--exit'] : []),
      options.pattern || '{,!(node_modules)/**/}*.spec.js',
    ],
    {
      env: {
        NODE_ENV: 'test',
        ...(this.packageConfig.type === 'module' && {
          NODE_OPTIONS: `--experimental-loader=${packageName`@dword-design/babel-register-esm`}`,
        }),
        ...(options.updateSnapshots && { SNAPSHOT_UPDATE: 1 }),
      },
      ...(options.log ? { stdio: 'inherit' } : { all: true }),
    }
  )
}
