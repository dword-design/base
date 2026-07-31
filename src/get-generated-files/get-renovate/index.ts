import defu from '@dword-design/defu';

import type { Base } from '@/src';

import getRegexManagerString from './get-regex-manager-string';

export default (base: Base) =>
  defu(base.config.renovateConfig, {
    extends: [':semanticCommits', ':semanticPrefixFix'],
    'github-actions': { enabled: false },
    gitIgnoredAuthors: ['actions@github.com'],
    labels: ['maintenance'],
    lockFileMaintenance: {
      automerge: true,
      enabled: true,
      ...(!base.config.isLockFileFixCommitType && {
        semanticCommitType: 'chore',
      }),
    },
    rangeStrategy: 'replace',
    regexManagers: [
      {
        datasourceTemplate: 'github-tags',
        fileMatch: [String.raw`\.ts$`],
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
        fileMatch: [String.raw`\.ts$`],
        matchStrings: [
          getRegexManagerString('nodejsVersion', '(?<currentValue>.*?)'),
        ],
        versioningTemplate: 'node',
      },
    ],
    semanticCommitScope: null,
  });
