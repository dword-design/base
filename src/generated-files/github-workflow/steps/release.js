import ci from '@dword-design/ci/package.json'
import { first, keys } from '@dword-design/functions'

import config from '@/src/config'

const bin = ci.bin |> keys |> first

export default [
  {
    env: {
      GITHUB_REPOSITORY: '${{ secrets.GITHUB_REPOSITORY }}',
      GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}',
    },
    name: 'Push changed files',
    run: `yarn ${bin} push-changed-files`,
  },
  {
    env: {
      GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}',
      ...(config.npmPublish ? { NPM_TOKEN: '${{ secrets.NPM_TOKEN }}' } : {}),
      ...config.deployEnv,
    },
    name: 'Release',
    run: 'yarn semantic-release',
  },
]
