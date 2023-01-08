import { execa } from 'execa'
import { createRequire } from 'module'
import parsePackagejsonName from 'parse-packagejson-name'

const require = createRequire(import.meta.url)

export default async function (options) {
  const packageName = parsePackagejsonName(this.packageConfig.name).fullName
  if (
    this.config.git !== undefined &&
    packageName !== this.config.git.project
  ) {
    throw new Error(
      `Package name '${packageName}' has to be equal to repository name '${this.config.git.project}'`
    )
  }
  options = {
    resolvePluginsRelativeTo: require.resolve('@dword-design/eslint-config'),
    ...options,
  }
  try {
    await execa(
      'eslint',
      [
        '--fix',
        '--ext',
        '.js,.json,.vue',
        '--ignore-path',
        '.gitignore',
        '--resolve-plugins-relative-to',
        options.resolvePluginsRelativeTo,
        '.',
      ],
      { all: true }
    )
  } catch (error) {
    throw new Error(error.all)
  }
  await this.config.lint()
}
