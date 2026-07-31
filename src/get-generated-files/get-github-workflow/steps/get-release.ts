import packageName from 'depcheck-package-name';
import parsePackagejsonName from 'parse-packagejson-name';

import type { Base } from '@/src';

const ci = `dw-${parsePackagejsonName(packageName`@dword-design/ci`).fullName}`;

export default (base: Base) => [
  {
    env: {
      GITHUB_REPOSITORY: '${{ secrets.GITHUB_REPOSITORY }}',
      GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}',
    },
    name: 'Push changed files',
    run: `pnpm ${ci} push-changed-files`,
  },
  ...[
    ...base.config.preDeploySteps,
    {
      env: {
        GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}',
        ...base.config.deployEnv,
      },
      name: 'Release',
      run: 'pnpm semantic-release',
    },
  ].map(step => ({
    if: "github.ref == 'refs/heads/master'",
    ...(step as object),
  })),
];
