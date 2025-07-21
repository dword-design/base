import { identity, sortBy } from 'lodash-es';

export default function () {
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
