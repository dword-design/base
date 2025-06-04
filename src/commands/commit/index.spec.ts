import * as pathLib from 'node:path';

import { expect, test } from '@playwright/test';
import { execaCommand } from 'execa';
import fs from 'fs-extra';
import { pEvent } from 'p-event';

import { Base } from '@/src/index.js';

const tests = { 'allow-empty': { allowEmpty: true }, valid: {} };

for (const [name, testConfig] of Object.entries(tests)) {
  test(name, async ({}, testInfo) => {
    const cwd = testInfo.outputPath();
    await fs.outputFile(pathLib.join(cwd, 'foo.txt'), '');
    await execaCommand('git init', { cwd });
    await execaCommand('git config user.email "foo@bar.de"', { cwd });
    await execaCommand('git config user.name "foo"', { cwd });
    await execaCommand('git add .', { cwd });
    const base = new Base(null, { cwd });
    const childProcess = base.commit(testConfig);

    await pEvent(childProcess.stdout, 'data', data =>
      data.toString().includes('Select the type of change'),
    );

    childProcess.stdin.write('\n');

    await pEvent(childProcess.stdout, 'data', data =>
      data.toString().includes('What is the scope of this change'),
    );

    childProcess.stdin.write('config\n');

    await pEvent(childProcess.stdout, 'data', data =>
      data.toString().includes('Write a short, imperative tense description'),
    );

    childProcess.stdin.write('foo bar\n');

    await pEvent(childProcess.stdout, 'data', data =>
      data.toString().includes('Provide a longer description'),
    );

    childProcess.stdin.write('\n');

    await pEvent(childProcess.stdout, 'data', data =>
      data.toString().includes('Are there any breaking changes'),
    );

    childProcess.stdin.write('\n');

    await pEvent(childProcess.stdout, 'data', data =>
      data.toString().includes('Does this change affect any open issues'),
    );

    childProcess.stdin.write('\n');
    await childProcess;
    const output = await execaCommand('git log', { cwd });
    expect(output.stdout).toMatch('feat(config): foo bar');
  });
}
