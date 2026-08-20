import pathLib from 'node:path';

import { execaCommand } from 'execa';
import { globby } from 'globby';
import ts from 'typescript';

import type { Base } from '@/src';
import type { PartialCommandOptions } from '@/src/commands/command-options-input';
import getTypescriptConfig from '@/src/get-generated-files/get-typescript';

export default async (base: Base, options: PartialCommandOptions = {}) => {
  options = {
    log: process.env.NODE_ENV !== 'test',
    stderr: 'inherit',
    ...options,
  };

  await base.config.typecheck(base, options);

  const { config } = ts.readConfigFile(
    pathLib.join(base.cwd, 'tsconfig.json'),
    ts.sys.readFile,
  );

  const { fileNames } = ts.parseJsonConfigFileContent(config, ts.sys, base.cwd);

  const vueFiles = await globby('**/*.vue', {
    cwd: base.cwd,
    dot: true,
    ignore: ['**/node_modules/**'],
  });

  const allFileNames = [...fileNames, ...vueFiles];

  if (allFileNames.length > 0) {
    const hasProjectReferences = !!getTypescriptConfig(base).references;
    return execaCommand(
      `vue-tsc ${hasProjectReferences ? '-b' : ''} --noEmit`,
      {
        ...(options.log && { stdout: 'inherit' }),
        cwd: base.cwd,
        stderr: options.stderr,
      },
    );
  }
};
