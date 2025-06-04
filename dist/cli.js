#!/usr/bin/env node
import { mapValues } from 'lodash-es';
import makeCli from 'make-cli';

import { Base } from './index.js';
import loadConfig from './load-config/index.js';

const base = new Base(await loadConfig());

const testOptions = [
  {
    description: 'Only run tests matching this string or regexp',
    name: '-g, --grep <grep>',
  },
  { description: 'Update snapshots', name: '-u, --update-snapshots' },
  { description: 'Run tests in interactive UI mode', name: '--ui-host <host>' },
  {
    description:
      'Host to serve UI on; specifying this option opens UI in a browser tab',
    name: '--ui',
  },
];

try {
  await makeCli({
    commands: Object.values(
      mapValues(
        {
          checkUnknownFiles: { handler: () => base.checkUnknownFiles() },
          commit: {
            handler: () => base.commit(),
            options: [
              { description: 'Allow empty commits', name: '--allow-empty' },
            ],
          },
          depcheck: { handler: () => base.depcheck() },
          lint: { handler: () => base.lint() },
          prepare: { handler: () => base.prepare() },
          ...(base.config.testInContainer && {
            'test:raw': {
              arguments: '[patterns...]',
              handler: (patterns, options) =>
                base.testRaw({ patterns, ...options }),
              options: testOptions,
            },
          }),
          test: {
            arguments: '[patterns...]',
            handler: (patterns, options) => base.test({ patterns, ...options }),
            options: testOptions,
          },
          ...mapValues(base.config.commands, (command, name) => ({
            ...command,
            handler: (...args) => base.run(name, ...args),
          })),
        },
        (command, name) => ({ name, ...command }),
      ),
    ),
  });
} catch (error) {
  console.error(error);
  process.exit(1);
}
