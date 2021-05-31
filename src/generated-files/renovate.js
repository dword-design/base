import baseConfig from '@/src/config'
import packageConfig from '@/src/package-config'

export default {
  ...(packageConfig.name !== '@dword-design/base' && {
    ignorePaths: ['.github/workflows/build.yml'],
  }),
  extends: [':semanticCommits'],
  labels: ['maintenance'],
  lockFileMaintenance: {
    enabled: true,
  },
  packageRules: [
    {
      matchPaths: [
        'package.json',
        ...(baseConfig.isLockFileFixCommitType ? ['yarn.lock'] : []),
      ],
      semanticCommitType: 'fix',
    },
  ],
  semanticCommitScope: null,
}
