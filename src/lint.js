import execa from 'execa'
import parsePackagejsonName from 'parse-packagejson-name'

export default async (config, options) => {
  const packageName = parsePackagejsonName(config.package.name).fullName
  if (config.git !== undefined && packageName !== config.git.project) {
    throw new Error(
      `Package name '${packageName}' has to be equal to repository name '${config.git.project}'`
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
  await config.lint()
}
