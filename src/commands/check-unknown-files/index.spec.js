import { isEmpty } from '@dword-design/functions';
import tester from '@dword-design/tester';
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir';
import outputFiles from 'output-files';

import { Base } from '@/src/index.js';

import UnknownFilesError from './unknown-files-error.js';

export default tester(
  {
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
  },
  [
    testerPluginTmpDir(),
    {
      transform: test => {
        test = {
          allowedMatches: [],
          configFiles: [],
          files: {},
          gitignore: [],
          result: {},
          ...test,
        };

        return async () => {
          await outputFiles(test.files);
          const base = new Base({ allowedMatches: test.allowedMatches });

          if (isEmpty(test.result)) {
            await base.checkUnknownFiles();
          } else {
            await expect(base.checkUnknownFiles()).rejects.toThrow(
              new UnknownFilesError(test.result),
            );
          }
        };
      },
    },
  ],
);
