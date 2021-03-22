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
      packagePatterns: ['*'],
      semanticCommitType: 'chore',
    },
    {
      depTypeList: [
        'dependencies',
        'devDependencies',
        'peerDependencies',
        'optionalDependencies',
      ],
      semanticCommitType: 'fix',
    },
  ],
  semanticCommitScope: null,
}
