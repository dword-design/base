import { expect, test } from '@playwright/test';
import endent from 'endent';
import { execaCommand } from 'execa';
import outputFiles from 'output-files';

import { Base } from '@/src';
import self from '.'

test('badges', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await execaCommand('git init', { cwd });

  await execaCommand(
    'git remote add origin git@github.com:dword-design/bar.git',
    { cwd },
  );

  await outputFiles(cwd, {
    'package.json': JSON.stringify({
      name: '@dword-design/foo',
      repository: 'dword-design/base',
    }),
    'README.md': '<!-- BADGES -->\n',
  });

  expect(self(new Base(null, { cwd }))).toMatchSnapshot();
});

test('badges private', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await execaCommand('git init', { cwd });

  await execaCommand(
    'git remote add origin git@github.com:dword-design/bar.git',
    { cwd },
  );

  await outputFiles(cwd, {
    'package.json': JSON.stringify({
      name: '@dword-design/foo',
      private: true,
    }),
    'README.md': endent`
      <!-- BADGES -->

    `,
  });

  expect(self(new Base(null, { cwd }))).toMatchSnapshot();
});

test('description', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'package.json': JSON.stringify({ description: 'foo bar baz' }),
    'README.md': '<!-- DESCRIPTION -->\n',
  });

  expect(self(new Base(null, { cwd }))).toEqual(endent`
    <!-- DESCRIPTION/ -->
    foo bar baz
    <!-- /DESCRIPTION -->\n
  `);
});

test('existing content', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'package.json': JSON.stringify({
      author: 'dword-design',
      description: 'foo bar baz',
      license: 'MIT',
    }),
    'README.md': endent`
      <!-- DESCRIPTION -->

      This is a more detailed description

      <!-- LICENSE -->

    `,
  });

  expect(self(new Base(null, { cwd }))).toMatchSnapshot();
});

test('install', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'package.json': JSON.stringify({ name: 'foo' }),
    'README.md': '<!-- INSTALL -->\n',
  });

  expect(self(new Base(null, { cwd }))).toEqual(endent`
    <!-- INSTALL/ -->
    ## Install

    \`\`\`bash
    # npm
    $ npm install foo

    # Yarn
    $ yarn add foo
    \`\`\`
    <!-- /INSTALL -->\n
  `);
});

test('license', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'package.json': JSON.stringify({ license: 'MIT' }),
    'README.md': '<!-- LICENSE -->\n',
  });

  expect(self(new Base(null, { cwd }))).toMatchSnapshot();
});

test('seeAlso', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'package.json': JSON.stringify({ license: 'MIT' }),
    'README.md': '<!-- LICENSE -->\n',
  });

  expect(
    self(new Base(
      {
        seeAlso: [
          { description: 'Foo bar', repository: 'output-files' },
          { description: 'Bar baz', repository: 'foo/with-local-tmp-dir' },
        ],
      },
      { cwd },
    )),
  ).toMatchSnapshot();
});

test('title', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'package.json': JSON.stringify({ name: 'foo' }),
    'README.md': '<!-- TITLE -->\n',
  });

  expect(self(new Base(null, { cwd }))).toEqual(endent`
    <!-- TITLE/ -->
    # foo
    <!-- /TITLE -->\n
  `);
});
