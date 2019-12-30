import requireHookTest from '@dword-design/require-hook-test'
import babelRegister from '@babel/register'
import nodeConfig from '@dword-design/base-config-node'

requireHookTest()
babelRegister({ ...nodeConfig.babelConfig, ignore: [/node_modules/] })
