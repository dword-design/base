import pathLib from 'node:path';

import { execaCommand } from 'execa';
import { globby } from 'globby';
import ts from 'typescript';

import type { CommandOptionsInput } from '@/src/commands/command-options-input';

export default async function (optionsInput?: CommandOptionsInput) {
  const options = {
    log: process.env.NODE_ENV !== 'test',
    stderr: 'inherit',
    ...optionsInput,
  };

  const { config } = ts.readConfigFile(
    pathLib.join(this.cwd, 'tsconfig.json'),
    ts.sys.readFile,
  );

  const { fileNames } = ts.parseJsonConfigFileContent(config, ts.sys, this.cwd);

  const vueFiles = await globby('**/*.vue', {
    cwd: this.cwd,
    dot: true,
    ignore: ['**/node_modules/**'],
  });

  const allFileNames = [...fileNames, ...vueFiles];

  if (allFileNames.length > 0) {
    return execaCommand('vue-tsc --noEmit', {
      ...(options.log && { stdout: 'inherit' }),
      cwd: this.cwd,
      stderr: options.stderr,
    });
  }
}
