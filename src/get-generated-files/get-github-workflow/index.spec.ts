import pathLib from 'node:path';

import { test } from '@playwright/test';
import { execaCommand } from 'execa';
import fs from 'fs-extra';
import isCI from 'is-ci';
import outputFiles from 'output-files';
import { expect } from 'playwright-expect-snapshot';

import { Base } from '@/src';

test('GitHub CLI exists', async () => {
  if (isCI) {
    await execaCommand('gh version');
  }
});

test('job matrix', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await fs.outputFile(pathLib.join(cwd, 'package.json'), JSON.stringify({}));
  const base = new Base(null, { cwd });
  expect(base.getGithubWorkflowConfig()).toMatchSnapshot();
});

test('macos', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await fs.outputFile(pathLib.join(cwd, 'package.json'), JSON.stringify({}));
  const base = new Base({ macos: true }, { cwd });
  expect(base.getGithubWorkflowConfig()).toMatchSnapshot();
});

test('no windows', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await fs.outputFile(pathLib.join(cwd, 'package.json'), JSON.stringify({}));
  const base = new Base({ windows: false }, { cwd });
  expect(base.getGithubWorkflowConfig()).toMatchSnapshot();
});

test('multiple supported node versions', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await fs.outputFile(pathLib.join(cwd, 'package.json'), JSON.stringify({}));

  const base = new Base(
    { supportedNodeVersions: [20, 22], windows: false },
    { cwd },
  );

  expect(base.getGithubWorkflowConfig()).toMatchSnapshot();
});

test('simple', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await fs.outputFile(pathLib.join(cwd, 'package.json'), JSON.stringify({}));
  const base = new Base({ windows: false }, { cwd });
  expect(base.getGithubWorkflowConfig()).toMatchSnapshot();
});

test('package.json', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    '.env.schema.json': JSON.stringify({ foo: { type: 'string' } }),
    'repos/foo/package.json': JSON.stringify({}),
  });

  const base = new Base(null, { cwd: pathLib.join(cwd, 'repos', 'foo') });
  expect(base.getGithubWorkflowConfig()).toMatchSnapshot();
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
  expect(base.getGithubWorkflowConfig()).toMatchSnapshot();
});

test('environment variables', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    '.env.schema.json': JSON.stringify({ bar: {}, foo: {} }),
    'package.json': JSON.stringify({}),
  });

  const base = new Base({ windows: false }, { cwd });
  expect(base.getGithubWorkflowConfig()).toMatchSnapshot();
});

test('testInContainer', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await fs.outputFile(pathLib.join(cwd, 'package.json'), JSON.stringify({}));
  const base = new Base({ testInContainer: true }, { cwd });
  expect(base.getGithubWorkflowConfig()).toMatchSnapshot();
});
