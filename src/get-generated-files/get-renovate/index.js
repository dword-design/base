import deepmerge from 'deepmerge';

export default function () {
  return deepmerge(
    {
      extends: [':semanticCommits', ':semanticPrefixFix'],
      gitIgnoredAuthors: ['actions@github.com'],
      'github-actions': { enabled: false },
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
            '(?<!\\w)gitHubAction`(?<depName>.*?)@v(?<currentValue>.*?)`',
          ],
          versioningTemplate: 'npm',
        },
        {
          datasourceTemplate: 'node-version',
          fileMatch: ['\\.js$'],
          depNameTemplate: 'node',
          datasourceTemplate: 'node-version',
          versioningTemplate: 'node',
          matchStrings: [
            '(?<!\\w)nodejsVersion`(?<currentValue>.*?)`',
          ],
        },
      ],
      semanticCommitScope: null,
    },
    this.config.renovateConfig || {},
  );
}
