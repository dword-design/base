import { first, keys, map } from '@dword-design/functions'
import packageName from 'depcheck-package-name'
import { createRequire } from 'module'

const _require = createRequire(import.meta.url)

const ci = _require(`${packageName`@dword-design/ci`}/package.json`)

const bin = ci.bin |> keys |> first

export default config => [
  {
    env: {
      GITHUB_REPOSITORY: '${{ secrets.GITHUB_REPOSITORY }}',
      GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}',
    },
    name: 'Push changed files',
    run: `yarn ${bin} push-changed-files`,
  },
  ...([
    ...config.preDeploySteps,
    {
      env: {
        GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}',
        ...(config.npmPublish ? { NPM_TOKEN: '${{ secrets.NPM_TOKEN }}' } : {}),
        ...config.deployEnv,
      },
      name: 'Release',
      run: 'yarn semantic-release',
    },
  ] |> map(step => ({ if: "github.ref == 'refs/heads/master'", ...step }))),
]
