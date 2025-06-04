import deepmerge from 'deepmerge';

import getRegexManagerString from './get-regex-manager-string';

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
          fileMatch: [String.raw`\.js$`],
          matchStrings: [
            getRegexManagerString(
              'gitHubAction',
              '(?<depName>.*?)@v(?<currentValue>.*?)',
            ),
          ],
          versioningTemplate: 'npm',
        },
        {
          datasourceTemplate: 'node-version',
          depNameTemplate: 'node',
          fileMatch: [String.raw`\.js$`],
          matchStrings: [
            getRegexManagerString('nodejsVersion', '(?<currentValue>.*?)'),
          ],
          versioningTemplate: 'node',
        },
      ],
      semanticCommitScope: null,
    },
    this.config.renovateConfig || {},
  );
}
