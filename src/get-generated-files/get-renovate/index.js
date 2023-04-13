export default function () {
  return {
    extends: [':semanticCommits', ':semanticPrefixFix'],
    'github-actions': {
      enabled: false,
    },
    labels: ['maintenance'],
    lockFileMaintenance: {
      automerge: true,
      enabled: true,
      ...(this.config.isLockFileFixCommitType
        ? {}
        : { semanticCommitType: 'chore' }),
    },
    rangeStrategy: 'replace',
    regexManagers: [
      {
        datasourceTemplate: 'github-tags',
        fileMatch: ['\\.js$'],
        matchStrings: [
          '(^|\\s)gitHubAction`(?<depName>.*?)@v(?<currentValue>.*?)`',
        ],
        versioningTemplate: 'npm',
      },
    ],
    semanticCommitScope: null,
  }
}
