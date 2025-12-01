import { identity, sortBy } from 'lodash-es';

export default function () {
  return sortBy(
    [
      '.DS_Store',
      '/.pnpm-store', // https://github.com/orgs/pnpm/discussions/6936#discussioncomment-6746063
      '/.env.json',
      '/.test.env.json',
      '/.nyc_output',
      '/codecov',
      '/codecov.SHA256SUM',
      '/codecov.SHA256SUM.sig',
      '/coverage',
      '/node_modules',
      '/test-results',
      ...this.config.gitignore,
    ],
    identity,
  );
}
