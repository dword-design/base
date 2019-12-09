import babelRegister from '@babel/register'
import babelConfig from '@dword-design/babel-config'
import spawnWrap from 'spawn-wrap'
import moduleAlias from 'module-alias'
import { getForTests as getAliasesForTests } from '@dword-design/aliases'

babelRegister({ ...babelConfig, ignore: [/node_modules/] })

moduleAlias.addAliases(getAliasesForTests())

spawnWrap([require.resolve('./spawn-wrap')])
