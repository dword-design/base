import execa from 'execa'
import parsePackagejsonName from 'parse-packagejson-name'

import config from '@/src/config'
import gitInfo from '@/src/git-info'
import packageConfig from '@/src/package-config'

export default async options => {
  const packageName = parsePackagejsonName(packageConfig.name).fullName
  if (gitInfo !== undefined && packageName !== gitInfo.project) {
    throw new Error(
      `Package name '${packageName}' has to be equal to repository name '${gitInfo.project}'`
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
