import { userInfo as getUserInfo } from 'node:os';

import { constantCase } from 'change-case';
import { execa } from 'execa';
import { findUpSync } from 'find-up';
import fs from 'fs-extra';

export default async function (options) {
  options = {
    log: process.env.NODE_ENV !== 'test',
    patterns: [],
    stderr: 'inherit',
    ...options,
  };

  const volumeName = this.packageConfig.name.replace('@', '').replace('/', '-');
  const envSchemaPath = findUpSync('.env.schema.json', { cwd: this.cwd });

  const envVariableNames = Object.keys({
    CI: true,
    ...(envSchemaPath ? await fs.readJson(envSchemaPath) : {}),
  }).map(name => constantCase(name));

  const userInfo = getUserInfo();

  try {
    return await execa(
      'docker',
      [
        'run',
        '--rm',
        ...envVariableNames
          .filter(name => process.env[name] !== undefined)
          .flatMap(name => ['--env', `${name}=${process.env[name]}`]),
        '-v',
        `${this.cwd}:/app`,
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
        cwd: this.cwd,
        ...(options.log && { stdout: 'inherit' }),
        stderr: options.stderr,
      },
    );
  } finally {
    await execa(
      'docker',
      [
        'run',
        '--rm',
        '--tty',
        '-v',
        `${this.cwd}:/app`,
        '-v',
        `${volumeName}:/app/node_modules`,
        'dworddesign/testing:latest',
        'bash',
        '-c',
        `chown -R ${userInfo.uid}:${userInfo.gid} /app`,
      ],
      { cwd: this.cwd },
    );
  }
}
