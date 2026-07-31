#!/usr/bin/env node

import dotenv from '@dword-design/dotenv-json-extended';
import { mapValues } from 'lodash-es';
import makeCli from 'make-cli';

import { Base } from '.';
import loadConfig from './load-config';

const base = new Base(await loadConfig());

const testHostOptions = [
  { description: 'Run tests in interactive UI mode', name: '--ui-host <host>' },
  {
    description:
      'Host to serve UI on; specifying this option opens UI in a browser tab',
    name: '--ui',
  },
];

const testOptions = [
  {
    description: 'Only run tests matching this string or regexp',
    name: '-g, --grep <grep>',
  },
  { description: 'Update snapshots', name: '-u, --update-snapshots' },
  ...(base.config.testInContainer ? [] : testHostOptions),
];

type TestOptions = {
  grep: string;
  ui: boolean;
  uiHost: string;
  updateSnapshots: boolean;
};

try {
  await makeCli({
    commands: {
      checkUnknownFiles: { handler: () => base.checkUnknownFiles() },
      commit: {
        handler: () => base.commit(),
        options: [
          { description: 'Allow empty commits', name: '--allow-empty' },
        ],
      },
      depcheck: {
        handler: () => {
          dotenv.config();
          return base.depcheck();
        },
      },
      lint: { handler: () => base.lint() },
      prepare: { handler: () => base.prepare() },
      test: {
        arguments: '[patterns...]',
        handler: (patterns: string[], options: TestOptions) =>
          base.test({ patterns, ...options }),
        options: testOptions,
      },
      typecheck: { handler: () => base.typecheck() },
      ...(base.config.testInContainer && {
        'test:raw': {
          arguments: '[patterns...]',
          handler: (patterns: string[], options: TestOptions) =>
            base.testRaw({ patterns, ...options }),
          options: testOptions,
        },
      }),
      verify: {
        arguments: '[patterns...]',
        handler: (patterns: string[], options: TestOptions) => {
          dotenv.config();
          return base.verify({ patterns, ...options });
        },
        options: testOptions,
      },
      ...mapValues(base.config.commands, (command, name) => ({
        ...command,
        handler: (...arguments_: unknown[]) => base.run(name, ...arguments_),
      })),
    },
  });
} catch (error) {
  console.error(error);
  process.exit(1);
}
