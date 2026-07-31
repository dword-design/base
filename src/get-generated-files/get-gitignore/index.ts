import { identity, sortBy } from 'lodash-es';

import type { Base } from '@/src';

export default (base: Base) =>
  sortBy(
    [
      '.DS_Store',
      '/.pnpm-store', // https://github.com/orgs/pnpm/discussions/6936#discussioncomment-6746063
      '/.env.json',
      '/.test.env.json',
      '/codecov',
      '/codecov.SHA256SUM',
      '/codecov.SHA256SUM.sig',
      '/coverage',
      '/node_modules',
      '/test-results',
      ...(base.getTypescriptConfig().references
        ? ['/tsconfig.tsbuildinfo']
        : []),
      ...base.config.gitignore,
    ],
    identity,
  );
