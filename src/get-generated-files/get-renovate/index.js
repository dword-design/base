export default function () {
  return {
    ...(this.config.package.name !== '@dword-design/base' && {
      ignorePaths: ['.github/workflows/build.yml'],
    }),
    extends: [':semanticCommits', ':semanticPrefixFix'],
    labels: ['maintenance'],
    lockFileMaintenance: {
      automerge: true,
      enabled: true,
      ...(this.config.isLockFileFixCommitType
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
}
