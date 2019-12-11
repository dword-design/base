import babelRegister from '@babel/register'
import babelConfig from '@dword-design/babel-config'
import moduleAlias from 'module-alias'
import { getForTests as getAliasesForTests } from '@dword-design/aliases'

babelRegister({ ...babelConfig, ignore: [/node_modules/] })

moduleAlias.addAliases(getAliasesForTests())
