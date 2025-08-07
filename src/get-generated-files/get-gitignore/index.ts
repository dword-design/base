import { identity, sortBy } from 'lodash-es';
import type { Base } from '@/src';

export default function (this: Base) {
  return sortBy(
    [
      '/codecov',
      '/codecov.SHA256SUM',
      '/codecov.SHA256SUM.sig',
      '.DS_Store',
      '/.env.json',
      '/.test.env.json',
      '/.nyc_output',
      '/coverage',
      '/node_modules',
      '/test-results',
      ...this.config.gitignore,
    ],
    identity,
  );
}
