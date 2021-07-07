import baseConfig from '@/src/config'
import packageConfig from '@/src/package-config'

export default {
  ...(packageConfig.name !== '@dword-design/base' && {
    ignorePaths: ['.github/workflows/build.yml'],
  }),
  extends: [':semanticCommits', ':semanticPrefixFix', ':automergeMinor'],
  labels: ['maintenance'],
  lockFileMaintenance: {
    enabled: true,
    ...(baseConfig.isLockFileFixCommitType
      ? {}
      : { semanticCommitType: 'chore' }),
  },
  semanticCommitScope: null,
}
