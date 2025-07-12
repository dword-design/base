import pathLib from 'node:path';

import dotenv from '@dword-design/dotenv-json-extended';
import { expect, test } from '@playwright/test';
import { execa, execaCommand } from 'execa';
import fs from 'fs-extra';

import { Base } from '@/src';

dotenv.config();

test('custom config', ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  expect(
    new Base({ renovateConfig: { foo: 'bar' } }, { cwd }).getRenovateConfig()
      .foo,
  ).toEqual('bar');
});

test('custom config array', ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  expect(
    new Base(
      { renovateConfig: { labels: ['foo'] } },
      { cwd },
    ).getRenovateConfig().labels,
  ).toEqual(['maintenance', 'foo']);
});

test('github action', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await execaCommand('git init', { cwd });
  await execaCommand('git config user.email "foo@bar.de"', { cwd });
  await execaCommand('git config user.name "foo"', { cwd });

  await fs.outputFile(
    pathLib.join(cwd, 'index.ts'),
    'gitHubAction`actions/checkout@v3`',
  );

  const base = new Base(null, { cwd });
  await base.prepare();
  await execaCommand('git add .', { cwd });
  await execa('git', ['commit', '-m', 'feat: init'], { cwd });

  const { stdout } = await execaCommand(
    `renovate --platform=local --dry-run --host-rules=[{matchHost:'api.github.com',hostType:'github',token:'${process.env.RENOVATE_GITHUB_PERSONAL_ACCESS_TOKEN}'}]`,
    { cwd, env: { CODESPACES: false.toString(), LOG_LEVEL: 'debug' } },
  );

  expect(stdout).toMatch(/renovate\/actions-checkout-\d+\.x/);
});

test('lock file', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await execaCommand('git init', { cwd });
  await execaCommand('git config user.email "foo@bar.de"', { cwd });
  await execaCommand('git config user.name "foo"', { cwd });

  await fs.outputFile(
    pathLib.join(cwd, 'package.json'),
    JSON.stringify({ dependencies: { globby: '^13.0.0' } }),
  );

  await execaCommand('pnpm install', { cwd });
  const base = new Base(null, { cwd });
  await base.prepare();
  await execaCommand('git add .', { cwd });
  await execa('git', ['commit', '-m', 'feat: init'], { cwd });

  const { stdout } = await execaCommand('renovate --platform=local --dry-run', {
    cwd,
    env: { CODESPACES: false.toString(), LOG_LEVEL: 'debug' },
  });

  expect(stdout).toMatch('chore: lock file maintenance');
});

test('lock file fix commit type', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await execaCommand('git init', { cwd });
  await execaCommand('git config user.email "foo@bar.de"', { cwd });
  await execaCommand('git config user.name "foo"', { cwd });

  await fs.outputFile(
    pathLib.join(cwd, 'package.json'),
    JSON.stringify({ dependencies: { globby: '^13.0.0' } }),
  );

  await execaCommand('pnpm install', { cwd });
  const base = new Base({ isLockFileFixCommitType: true }, { cwd });
  await base.prepare();
  await execaCommand('git add .', { cwd });
  await execa('git', ['commit', '-m', 'feat: init'], { cwd });

  const { stdout } = await execaCommand('renovate --platform=local --dry-run', {
    cwd,
    env: { CODESPACES: false.toString(), LOG_LEVEL: 'debug' },
  });

  expect(stdout).toMatch('fix: lock file maintenance');
});

test('nodejs version', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await execaCommand('git init', { cwd });
  await execaCommand('git config user.email "foo@bar.de"', { cwd });
  await execaCommand('git config user.name "foo"', { cwd });
  await fs.outputFile(pathLib.join(cwd, 'index.ts'), 'nodejsVersion`18`');
  const base = new Base(null, { cwd });
  await base.prepare();
  await execaCommand('git add .', { cwd });
  await execa('git', ['commit', '-m', 'feat: init'], { cwd });

  const { stdout } = await execaCommand('renovate --platform=local --dry-run', {
    cwd,
    env: { CODESPACES: false.toString(), LOG_LEVEL: 'debug' },
  });

  expect(stdout).toMatch(/renovate\/node-\d+\.x/);
});

test('outdated version in package.json', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await execaCommand('git init', { cwd });
  await execaCommand('git config user.email "foo@bar.de"', { cwd });
  await execaCommand('git config user.name "foo"', { cwd });

  await fs.outputFile(
    pathLib.join(cwd, 'package.json'),
    JSON.stringify({ dependencies: { globby: '^13.0.0' } }),
  );

  const base = new Base(null, { cwd });
  await base.prepare();
  await execaCommand('git add .', { cwd });
  await execa('git', ['commit', '-m', 'feat: init'], { cwd });

  const { stdout } = await execaCommand('renovate --platform=local --dry-run', {
    cwd,
    env: { CODESPACES: false.toString(), LOG_LEVEL: 'debug' },
  });

  expect(stdout).toMatch(/renovate\/globby-\d+\.x/);
});
