import commitlintPackageConfig from '@commitlint/cli/package.json'
import { first, keys } from '@dword-design/functions'

export default {
  hooks: {
    'commit-msg': `${
      commitlintPackageConfig.bin |> keys |> first
    } -E HUSKY_GIT_PARAMS`,
  },
}
