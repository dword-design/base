import { userInfo as getUserInfo } from 'node:os';

import { constantCase } from 'change-case';
import { execa } from 'execa';
import { findUpSync } from 'find-up';
import fs from 'fs-extra';

import type { Base } from '@/src';
import type { PartialCommandOptions } from '@/src/commands/command-options-input';

export default async (
  base: Base,
  optionsInput: PartialCommandOptions & {
    grep?: string;
    patterns?: string[];
    updateSnapshots?: boolean;
  } = {},
) => {
  if (!base.packageConfig.name) {
    throw new Error(
      'package.json must have a name field to run tests in Docker.',
    );
  }

  const options = {
    grep: '',
    log: process.env.NODE_ENV !== 'test',
    patterns: [],
    stderr: 'inherit' as const,
    updateSnapshots: false,
    ...optionsInput,
  };

  const volumeName = base.packageConfig.name.replace('@', '').replace('/', '-');

  const environmentSchemaPath = findUpSync('.env.schema.json', {
    cwd: base.cwd,
  });

  const environmentVariableNames = Object.keys({
    CI: true,
    ...(environmentSchemaPath && (await fs.readJson(environmentSchemaPath))),
  }).map(name => constantCase(name));

  const userInfo = getUserInfo();

  try {
    return await execa(
      'docker',
      [
        'run',
        '--rm',
        ...environmentVariableNames
          .filter(name => process.env[name] !== undefined)
          .flatMap(name => ['--env', name]),
        '-v',
        `${base.cwd}:/app`,
        '-v',
        `${volumeName}:/app/node_modules`,
        'dworddesign/testing:latest',
        'bash',
        '-c',
        [
          'pnpm install --frozen-lockfile',
          '&&',
          'pnpm test:raw',
          ...(options.updateSnapshots ? [' --update-snapshots'] : []),
          ...options.patterns.map(pattern => `"${pattern}"`),
          ...(options.grep ? [`-g "${options.grep}"`] : []),
        ].join(' '),
      ],
      {
        cwd: base.cwd,
        stderr: options.stderr,
        // ...(options.log && { stdout: 'inherit' }),
        stdout: options.log ? 'inherit' : 'pipe',
      },
    );
  } finally {
    if (process.platform === 'linux') {
      await execa(
        'docker',
        [
          'run',
          '--rm',
          '--tty',
          '-v',
          `${base.cwd}:/app`,
          '-v',
          `${volumeName}:/app/node_modules`,
          'dworddesign/testing:latest',
          'bash',
          '-c',
          `chown -R ${userInfo.uid}:${userInfo.gid} /app`,
        ],
        { cwd: base.cwd },
      );
    }
  }
};
