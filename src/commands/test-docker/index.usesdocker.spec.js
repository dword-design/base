import P from 'node:path';

import { endent } from '@dword-design/functions';
import tester from '@dword-design/tester';
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir';
import { execaCommand } from 'execa';
import fs from 'fs-extra';
import outputFiles from 'output-files';
import yaml from 'yaml';

import { Base } from '@/src/index.js';

export default tester(
  {
    'create folder': async () => {
      await fs.outputFile(
        'package.json',
        JSON.stringify({
          name: P.basename(process.cwd()),
          scripts: {
            'test:raw': 'mkdir dist && echo "foo bar" > dist/index.js',
          },
        }),
      );

      await new Base().testDocker();
      await fs.remove('dist');
    },
    'create folder and error': async () => {
      await fs.outputFile(
        'package.json',
        JSON.stringify({
          name: P.basename(process.cwd()),
          scripts: {
            'test:raw':
              'mkdir dist && echo "foo bar" > dist/index.js && exit 1',
          },
        }),
      );

      await expect(new Base().testDocker()).rejects.toThrow();
      await fs.remove('dist');
    },
    env: async () => {
      await outputFiles({
        '.env.schema.json': JSON.stringify({
          bar: { type: 'string' },
          foo: { type: 'string' },
        }),
        'package.json': JSON.stringify({
          name: P.basename(process.cwd()),
          scripts: { 'test:raw': 'node test.js' },
        }),
        'test.js': endent`
          if (process.env.TEST_FOO !== 'foo') {
            throw new Error('Environment variable TEST_FOO is not set')
          }
          if (process.env.TEST_BAR !== undefined) {
            throw new Error('Environment variable TEST_BAR is set')
          }

        `,
      });

      const previousEnv = process.env;
      process.env.TEST_FOO = 'foo';

      try {
        await new Base().testDocker();
      } finally {
        process.env = previousEnv;
      }
    },
    git: async () => {
      await outputFiles({
        'package.json': JSON.stringify({
          name: P.basename(process.cwd()),
          scripts: { 'test:raw': 'node test.js' },
          type: 'module',
        }),
        'test.js': endent`
          import { spawn } from 'child_process'

          spawn('git', ['--help'])
        `,
      });

      await new Base().testDocker();
    },
    grep: async () => {
      await outputFiles({
        'package.json': JSON.stringify({
          name: P.basename(process.cwd()),
          scripts: { 'test:raw': 'node test.js' },
          type: 'module',
        }),
        'test.js': endent`
          import fs from 'fs'

          fs.writeFileSync('grep.txt', process.argv.slice(2).toString())
        `,
      });

      await new Base().testDocker({ grep: 'foo bar baz' });
      expect(await fs.readFile('grep.txt', 'utf8')).toEqual('-g,foo bar baz');
    },
    'is in docker': async () => {
      await outputFiles({
        'package.json': JSON.stringify({
          dependencies: { 'is-docker': '*' },
          name: P.basename(process.cwd()),
          scripts: { 'test:raw': 'node test.js' },
          type: 'module',
        }),
        'test.js': endent`
          import isDocker from 'is-docker'

          if (!isDocker) {
            process.exit(1)
          }

        `,
      });

      await execaCommand('pnpm install');
      const base = new Base();
      await base.testDocker();
    },
    pattern: async () => {
      await outputFiles({
        'package.json': JSON.stringify({
          name: P.basename(process.cwd()),
          scripts: { 'test:raw': 'node test.js' },
          type: 'module',
        }),
        'test.js': endent`
          import fs from 'fs'

          fs.writeFileSync('grep.txt', process.argv[2])
        `,
      });

      await new Base().testDocker({ patterns: ['foo bar baz'] });
      expect(await fs.readFile('grep.txt', 'utf8')).toEqual('foo bar baz');
    },
    puppeteer: async () => {
      await outputFiles({
        'package.json': JSON.stringify({
          dependencies: { '@dword-design/puppeteer': '*' },
          name: P.basename(process.cwd()),
          scripts: { 'test:raw': 'node test.js' },
          type: 'module',
        }),
        'pnpm-workspace.yaml': yaml.stringify({
          onlyBuiltDependencies: ['puppeteer'],
        }),
        'test.js': endent`
          import puppeteer from '@dword-design/puppeteer'

          const browser = await puppeteer.launch()
          await browser.close()
        `,
      });

      await execaCommand('pnpm install');
      await new Base().testDocker();
    },
    'update snapshots': async () => {
      await outputFiles({
        'package.json': JSON.stringify({
          name: P.basename(process.cwd()),
          scripts: { 'test:raw': 'node test.js' },
        }),
        'test.js': endent`
          if (process.argv[2] !== '--update-snapshots') {
            throw new Error('--update-snapshots is not set')
          }

        `,
      });

      await new Base().testDocker({ updateSnapshots: true });
    },
  },
  [
    testerPluginTmpDir(),
    {
      transform: test => async () => {
        try {
          await test();
        } finally {
          await execaCommand(`docker volume rm ${P.basename(process.cwd())}`);
        }
      },
    },
  ],
);
