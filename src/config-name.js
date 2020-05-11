import matchdep from 'matchdep'
import { first } from '@dword-design/functions'
import safeRequire from 'safe-require'
import P from 'path'
import getPackageName from 'get-package-name'

const packageConfig = safeRequire(P.join(process.cwd(), 'package.json')) ?? {}
const shortName =
  typeof packageConfig.baseConfig === 'string'
    ? packageConfig.baseConfig
    : packageConfig.baseConfig?.name ??
      getPackageName(require.resolve('@dword-design/base-config-node'))

export default (matchdep.filterAll(
  [`@dword-design/base-config-${shortName}`, `base-config-${shortName}`],
  packageConfig
) |> first) ?? shortName
