import { globby } from 'globby';
import ignore from 'ignore';

import type { Base } from '@/src';

import UnknownFilesError from './unknown-files-error';
import getGitignoreConfig from '@/src/get-generated-files/get-gitignore';

export default async (base: Base) => {
  const allowedMatches = [
    ...Object.keys(base.generatedFiles),
    ...Object.keys({
      '.baserc.json': true,
      '.env.schema.json': true,
      '.git': true,
      '.husky/_': true,
      '.husky/commit-msg': true,
      '.husky/post-checkout': true,
      '.husky/post-commit': true,
      '.husky/post-merge': true,
      '.husky/pre-commit': true,
      '.husky/pre-push': true,
      'base.config.ts': true,
      'CHANGELOG.md': true,
      demo: true,
      doc: true,
      fixtures: true,
      patches: true,
      'pnpm-lock.yaml': true,
      'pnpm-workspace.yaml': true,
      PRCHECKLIST: true,
    }),
    ...Object.keys({
      '**/*-snapshots/**': true, // For some reason without the trailing ** didn't work
      'playwright.config.ts': true,
    }),
    ...base.config.allowedMatches,
  ];

  let unknownFiles = await globby('**', {
    cwd: base.cwd,
    dot: true,
    gitignore: true,
    ignore: allowedMatches,
  });

  unknownFiles = unknownFiles.filter(
    ignore().add(getGitignoreConfig(base)).createFilter(),
  );

  if (unknownFiles.length > 0) {
    throw new UnknownFilesError(
      Object.fromEntries(unknownFiles.map(file => [file, true])),
    );
  }
};
