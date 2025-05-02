import { filter, fromPairs, keys, map } from '@dword-design/functions';
import { globby } from 'globby';
import ignore from 'ignore';

import UnknownFilesError from './unknown-files-error.js';

export default async function () {
  const allowedMatches = [
    ...(this.generatedFiles |> keys),
    ...Object.keys({
      '.baserc.json': true,
      '.env.schema.json': true,
      '.eslintrc.json': true,
      '.git': true,
      '.husky/_': true,
      '.husky/commit-msg': true,
      '.husky/post-checkout': true,
      '.husky/post-commit': true,
      '.husky/post-merge': true,
      '.husky/pre-push': true,
      'CHANGELOG.md': true,
      PRCHECKLIST: true,
      __image_snapshots__: true,
      __snapshots__: true,
      demo: true,
      doc: true,
      'global-test-hooks.js': true,
      'pnpm-lock.yaml': true,
      'pnpm-workspace.yaml': true,
      'types.d.ts': true,
    }),
    ...this.config.testRunner === 'playwright' ? ['playwright.config.js'] : [],
    ...this.config.allowedMatches,
  ];

  const unknownFiles =
    globby('**', { dot: true, gitignore: true, ignore: allowedMatches })
    |> await
    |> filter(ignore().add(this.getGitignoreConfig()).createFilter());

  if (unknownFiles.length > 0) {
    throw new UnknownFilesError(
      unknownFiles |> map(file => [file, true]) |> fromPairs,
    );
  }
}
