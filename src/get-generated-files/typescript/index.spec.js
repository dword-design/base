import { endent } from '@dword-design/functions';
import tester from '@dword-design/tester';
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir';
import { execaCommand } from 'execa';
import fs from 'fs-extra';
import outputFiles from 'output-files';

import self from './index.js';

export default tester(
  {
    alias: async () => {
      await outputFiles({
        src: { 'foo.ts': '', 'index.ts': "import '@/foo';" },
        'tsconfig.json': JSON.stringify(self),
      });

      await execaCommand('tsc --outDir dist');
      await execaCommand('tsc-alias --outDir dist --resolve-full-paths');

      expect(await fs.readFile('dist/index.js', 'utf8')).toEqual(
        "import './foo.js';\n",
      );
    },
    valid: async () => {
      await outputFiles({
        'src/index.ts': endent`
          const foo: string = 'bar';

          export default foo;\n
        `,
        'tsconfig.json': JSON.stringify(self),
      });

      await execaCommand('tsc --outDir dist');

      expect(await fs.readFile('dist/index.js', 'utf8')).toEqual(endent`
        const foo = 'bar';
        export default foo;\n
      `);
    },
  },
  [testerPluginTmpDir()],
);
