import babelRegister from '@babel/register'
import babelConfig from '@dword-design/babel-config'
import moduleAlias from 'module-alias'
import testAliases from '@dword-design/test-aliases'

babelRegister({ ...babelConfig, ignore: [/node_modules/] })

moduleAlias.addAliases(testAliases)
