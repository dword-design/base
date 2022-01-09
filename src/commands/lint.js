import execa from 'execa'
import parsePackagejsonName from 'parse-packagejson-name'

import config from '@/src/config'
import gitInfo from '@/src/git-info'
import packageConfig from '@/src/package-config'

export default async options => {
  if (
    gitInfo !== undefined &&
    parsePackagejsonName(packageConfig.name).moduleName !== gitInfo.project
  ) {
    throw new Error(
      `Package name '${packageConfig.name}' has to be equal to repository name '${gitInfo.project}'`
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
