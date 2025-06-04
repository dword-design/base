import packageName from 'depcheck-package-name';
import parsePackagejsonName from 'parse-packagejson-name';

const ci = `dw-${parsePackagejsonName(packageName`@dword-design/ci`).fullName}`;

export default function () {
  return [
    {
      env: {
        GITHUB_REPOSITORY: '${{ secrets.GITHUB_REPOSITORY }}',
        GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}',
      },
      name: 'Push changed files',
      run: `pnpm ${ci} push-changed-files`,
    },
    ...[
      ...this.config.preDeploySteps,
      {
        env: {
          GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}',
          ...(this.config.npmPublish
            ? { NPM_TOKEN: '${{ secrets.NPM_TOKEN }}' }
            : {}),
          ...this.config.deployEnv,
        },
        name: 'Release',
        run: 'pnpm semantic-release',
      },
    ].map(step => ({ if: "github.ref == 'refs/heads/master'", ...step })),
  ];
}
