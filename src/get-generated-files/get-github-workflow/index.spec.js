import P from 'node:path';

import chdir from '@dword-design/chdir';
import tester from '@dword-design/tester';
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir';
import { execaCommand } from 'execa';
import fs from 'fs-extra';
import isCI from 'is-ci';
import outputFiles from 'output-files';

import { Base } from '@/src/index.js';

export default tester(
  {
    'GitHub CLI exists': async () => {
      if (isCI) {
        await execaCommand('gh repo list');
      }
    },
    async 'job matrix'() {
      await fs.outputFile('package.json', JSON.stringify({}));

      expect(
        new Base({ useJobMatrix: true }).getGithubWorkflowConfig(),
      ).toMatchSnapshot(this);
    },
    async 'job matrix no macos'() {
      await fs.outputFile('package.json', JSON.stringify({}));

      expect(
        new Base({
          macos: false,
          useJobMatrix: true,
        }).getGithubWorkflowConfig(),
      ).toMatchSnapshot(this);
    },
    async 'job matrix no windows'() {
      await fs.outputFile('package.json', JSON.stringify({}));

      expect(
        new Base({
          useJobMatrix: true,
          windows: false,
        }).getGithubWorkflowConfig(),
      ).toMatchSnapshot(this);
    },
    async 'no job matrix'() {
      await fs.outputFile('package.json', JSON.stringify({}));
      expect(new Base({}).getGithubWorkflowConfig()).toMatchSnapshot(this);
    },
    async 'package.json'() {
      await outputFiles({
        '.env.schema.json': JSON.stringify({ foo: { type: 'string' } }),
        'repos/foo/package.json': JSON.stringify({}),
      });

      await chdir(P.join('repos', 'foo'), () =>
        expect(new Base().getGithubWorkflowConfig()).toMatchSnapshot(this),
      );
    },
    async 'package.json same path as .env.schema.json'() {
      await outputFiles({
        'repos/foo': {
          '.env.schema.json': JSON.stringify({ foo: { type: 'string' } }),
          'package.json': JSON.stringify({}),
        },
      });

      await chdir(P.join('repos', 'foo'), () =>
        expect(new Base().getGithubWorkflowConfig()).toMatchSnapshot(this),
      );
    },
    async 'test environment variables'() {
      await outputFiles({
        '.env.schema.json': JSON.stringify({ bar: {}, foo: {} }),
        'package.json': JSON.stringify({}),
      });

      expect(
        new Base({
          nodeVersion: 14,
          useJobMatrix: false,
        }).getGithubWorkflowConfig(),
      ).toMatchSnapshot(this);
    },
    async testInContainer() {
      await fs.outputFile('package.json', JSON.stringify({}));

      expect(
        new Base({
          nodeVersion: 14,
          testInContainer: true,
          useJobMatrix: true,
        }).getGithubWorkflowConfig(),
      ).toMatchSnapshot(this);
    },
  },
  [testerPluginTmpDir()],
);
