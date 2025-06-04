import pathLib from 'node:path';

import { expect, test } from '@playwright/test';
import { execaCommand } from 'execa';
import fs from 'fs-extra';
import isCI from 'is-ci';
import outputFiles from 'output-files';

import { Base } from '@/src';

test('GitHub CLI exists', async () => {
  if (isCI) {
    await execaCommand('gh repo list');
  }
});

test('job matrix', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await fs.outputFile(pathLib.join(cwd, 'package.json'), JSON.stringify({}));
  const base = new Base({ useJobMatrix: true }, { cwd });

  expect(
    JSON.stringify(base.getGithubWorkflowConfig(), undefined, 2),
  ).toMatchSnapshot();
});

test('job matrix no macos', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await fs.outputFile(pathLib.join(cwd, 'package.json'), JSON.stringify({}));
  const base = new Base({ macos: false, useJobMatrix: true }, { cwd });

  expect(
    JSON.stringify(base.getGithubWorkflowConfig(), undefined, 2),
  ).toMatchSnapshot();
});

test('job matrix no windows', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await fs.outputFile(pathLib.join(cwd, 'package.json'), JSON.stringify({}));
  const base = new Base({ useJobMatrix: true, windows: false }, { cwd });

  expect(
    JSON.stringify(base.getGithubWorkflowConfig(), undefined, 2),
  ).toMatchSnapshot();
});

test('no job matrix', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await fs.outputFile(pathLib.join(cwd, 'package.json'), JSON.stringify({}));
  const base = new Base(null, { cwd });

  expect(
    JSON.stringify(base.getGithubWorkflowConfig(), undefined, 2),
  ).toMatchSnapshot();
});

test('package.json', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    '.env.schema.json': JSON.stringify({ foo: { type: 'string' } }),
    'repos/foo/package.json': JSON.stringify({}),
  });

  const base = new Base(null, { cwd: pathLib.join(cwd, 'repos', 'foo') });

  expect(
    JSON.stringify(base.getGithubWorkflowConfig(), undefined, 2),
  ).toMatchSnapshot();
});

test('package.json same path as .env.schema.json', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'repos/foo': {
      '.env.schema.json': JSON.stringify({ foo: { type: 'string' } }),
      'package.json': JSON.stringify({}),
    },
  });

  const base = new Base(null, { cwd: pathLib.join(cwd, 'repos', 'foo') });

  expect(
    JSON.stringify(base.getGithubWorkflowConfig(), undefined, 2),
  ).toMatchSnapshot();
});

test('environment variables', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    '.env.schema.json': JSON.stringify({ bar: {}, foo: {} }),
    'package.json': JSON.stringify({}),
  });

  const base = new Base({ nodeVersion: 14, useJobMatrix: false }, { cwd });

  expect(
    JSON.stringify(base.getGithubWorkflowConfig(), undefined, 2),
  ).toMatchSnapshot();
});

test('testInContainer', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await fs.outputFile(pathLib.join(cwd, 'package.json'), JSON.stringify({}));

  const base = new Base(
    { nodeVersion: 14, testInContainer: true, useJobMatrix: true },
    { cwd },
  );

  expect(
    JSON.stringify(base.getGithubWorkflowConfig(), undefined, 2),
  ).toMatchSnapshot();
});
