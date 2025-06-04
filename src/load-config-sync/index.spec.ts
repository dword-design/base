import { tmpdir } from 'node:os';

import tester from '@dword-design/tester';
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir';
import fs from 'fs-extra';

import self from './index.js';

export default tester(
  {
    '.baserc.json': async () => {
      await fs.outputFile('.baserc.json', JSON.stringify({ foo: 'bar' }));
      expect(self()).toEqual({ foo: 'bar' });
    },
    none: () => expect(self()).toBeNull(),
    'package.json': async () => {
      await fs.outputFile(
        'package.json',
        JSON.stringify({ baseConfig: { foo: 'bar' } }),
      );

      expect(self()).toEqual({ foo: 'bar' });
    },
  },
  [testerPluginTmpDir({ dir: tmpdir(), tmpdir: tmpdir() })],
);
