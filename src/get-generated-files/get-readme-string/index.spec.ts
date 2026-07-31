import { expect, test } from '@playwright/test';
import endent from 'endent';
import { execaCommand } from 'execa';
import outputFiles from 'output-files';

import { Base } from '@/src';

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

  expect(new Base(null, { cwd }).getReadmeString()).toMatchSnapshot();
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

  expect(new Base(null, { cwd }).getReadmeString()).toMatchSnapshot();
});

test('description', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'package.json': JSON.stringify({ description: 'foo bar baz' }),
    'README.md': '<!-- DESCRIPTION -->\n',
  });

  expect(new Base(null, { cwd }).getReadmeString()).toEqual(endent`
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

  expect(new Base(null, { cwd }).getReadmeString()).toMatchSnapshot();
});

test('install', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'package.json': JSON.stringify({ name: 'foo' }),
    'README.md': '<!-- INSTALL -->\n',
  });

  expect(new Base(null, { cwd }).getReadmeString()).toEqual(endent`
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

  expect(new Base(null, { cwd }).getReadmeString()).toMatchSnapshot();
});

test('seeAlso', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'package.json': JSON.stringify({ license: 'MIT' }),
    'README.md': '<!-- LICENSE -->\n',
  });

  expect(
    new Base(
      {
        seeAlso: [
          { description: 'Foo bar', repository: 'output-files' },
          { description: 'Bar baz', repository: 'foo/with-local-tmp-dir' },
        ],
      },
      { cwd },
    ).getReadmeString(),
  ).toMatchSnapshot();
});

test('title', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'package.json': JSON.stringify({ name: 'foo' }),
    'README.md': '<!-- TITLE -->\n',
  });

  expect(new Base(null, { cwd }).getReadmeString()).toEqual(endent`
    <!-- TITLE/ -->
    # foo
    <!-- /TITLE -->\n
  `);
});
