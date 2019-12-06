import babelConfig from '@dword-design/babel-config'
import babelMerge from 'babel-merge'
import { getStandard as getStandardAliases, getForTests as getAliasesForTests } from '@dword-design/aliases'

export default babelMerge(
  { ...babelConfig, ignore: [/node_modules/] },
  {
    plugins: [
      [
        require.resolve('babel-plugin-module-resolver'),
        { alias: { ...getStandardAliases(), ...getAliasesForTests() } },
      ],
    ],
  },
)
