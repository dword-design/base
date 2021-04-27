import execa from 'execa'

import config from '@/src/config'

export default async options => {
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
