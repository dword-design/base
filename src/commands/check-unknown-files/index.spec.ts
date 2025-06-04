import { expect, test } from '@playwright/test';
import { isEmpty } from 'lodash-es';
import outputFiles from 'output-files';

import { Base } from '@/src/index.js';

import UnknownFilesError from './unknown-files-error.js';

const tests = {
  'config allowed matches': {
    allowedMatches: ['bar.txt'],
    files: { 'bar.txt': '', 'foo.txt': '' },
    result: { 'foo.txt': true },
  },
  'full path': {
    files: { '.github/workflows/foo.yml': '' },
    result: { '.github/workflows/foo.yml': true },
  },
  gitignore: { files: { '.env.json': '' } },
  husky: {
    files: {
      '.husky': {
        '.gitignore': '',
        _: { '.gitignore': '', 'husky.sh': '' },
        'commit-msg': '',
        'post-checkout': '',
        'post-commit': '',
        'post-merge': '',
        'pre-push': '',
      },
    },
    result: { '.husky/.gitignore': true },
  },
  subfolder: { allowedMatches: ['foo'], files: { 'foo/bar.txt': '' } },
  works: { files: { 'foo.txt': '' }, result: { 'foo.txt': true } },
};

for (const [name, _testConfig] of Object.entries(tests)) {
  const testConfig = {
    allowedMatches: [],
    configFiles: [],
    files: {},
    gitignore: [],
    result: {},
    ..._testConfig,
  };

  test(name, async ({}, testInfo) => {
    const cwd = testInfo.outputPath();
    await outputFiles(cwd, testConfig.files);

    const base = new Base(
      { allowedMatches: testConfig.allowedMatches },
      { cwd },
    );

    await (isEmpty(testConfig.result)
      ? base.checkUnknownFiles()
      : expect(base.checkUnknownFiles()).rejects.toThrow(
          new UnknownFilesError(testConfig.result),
        ));
  });
}
