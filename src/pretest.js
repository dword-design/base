import babelRegister from '@babel/register'
import babelConfig from '@dword-design/babel-config'
import spawnWrap from 'spawn-wrap'
import moduleAlias from 'module-alias'
import { forIn } from '@functions'
import { getForTests as getAliasesForTests } from '@dword-design/aliases'

babelRegister({ ...babelConfig, ignore: [/node_modules/] })

getAliasesForTests() |> forIn((path, name) => moduleAlias.addAlias(name, path))

spawnWrap([require.resolve('./spawn-wrap.js')])
