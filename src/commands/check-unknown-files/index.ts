import { globby } from 'globby';
import ignore from 'ignore';

import UnknownFilesError from './unknown-files-error';

export default async function () {
  const allowedMatches = [
    ...Object.keys(this.generatedFiles),
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
      'CHANGELOG.md': true,
      PRCHECKLIST: true,
      demo: true,
      doc: true,
      fixtures: true,
      'pnpm-lock.yaml': true,
      'pnpm-workspace.yaml': true,
    }),
    ...Object.keys({
      '**/*-snapshots/**': true, // For some reason without the trailing ** didn't work
      'playwright.config.ts': true,
    }),
    ...this.config.allowedMatches,
  ];

  let unknownFiles = await globby('**', {
    cwd: this.cwd,
    dot: true,
    gitignore: true,
    ignore: allowedMatches,
  });

  unknownFiles = unknownFiles.filter(
    ignore().add(this.getGitignoreConfig()).createFilter(),
  );

  if (unknownFiles.length > 0) {
    throw new UnknownFilesError(
      Object.fromEntries(unknownFiles.map(file => [file, true])),
    );
  }
}
