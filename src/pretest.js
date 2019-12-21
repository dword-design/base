import babelRegister from '@babel/register'
import babelConfig from '@dword-design/babel-config'
import requireHookTest from '@dword-design/require-hook-test'

babelRegister({ ...babelConfig, ignore: [/node_modules/] })
requireHookTest()
