import babelRegister from '@babel/register'
import config from './config'
import moduleAlias from 'module-alias'
import { getForTests as getAliasesForTests } from '@dword-design/aliases'

babelRegister({
  ...config.babelConfig !== undefined ? config.babelConfig : {},
  ignore: [/node_modules/],
})

moduleAlias.addAliases(getAliasesForTests())
