import requireHookTest from '@dword-design/require-hook-test'
import babelRegister from '@babel/register'
import babelConfig from '@dword-design/babel-config'

requireHookTest()
babelRegister({ ...babelConfig, ignore: [/node_modules/] })
