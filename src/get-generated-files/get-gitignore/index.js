import { identity, sortBy } from '@dword-design/functions';

export default function () {
  return (
    [
      '.DS_Store',
      '/.env.json',
      '/.test.env.json',
      '/.nyc_output',
      '/coverage',
      '/node_modules',
      '/.eslintignore',
      ...(this.config.testRunner === 'playwright' ? ['/test-results'] : []),
      ...this.config.gitignore,
    ] |> sortBy(identity)
  );
}
