import baseConfig from '@/src/config'
import packageConfig from '@/src/package-config'

export default {
  ...(packageConfig.name !== '@dword-design/base' && {
    ignorePaths: ['.github/workflows/build.yml'],
  }),
  extends: [':semanticCommits', ':semanticPrefixFix'],
  labels: ['maintenance'],
  lockFileMaintenance: {
    automerge: true,
    enabled: true,
    ...(baseConfig.isLockFileFixCommitType
      ? {}
      : { semanticCommitType: 'chore' }),
  },
  packageRules: [
    {
      automerge: true,
      matchCurrentVersion: '>=1.0.0',
      matchUpdateTypes: ['minor', 'patch'],
    },
  ],
  semanticCommitScope: null,
}
