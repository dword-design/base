import requireHookTest from '@dword-design/require-hook-test'
import babelRegister from '@babel/register'
import nodeConfig from '@dword-design/base-config-node'
import stealthyRequire from 'stealthy-require'

requireHookTest()

babelRegister({ ...nodeConfig.babelConfig, ignore: [/node_modules/] })

const config = stealthyRequire(require.cache, () => require('./config'))

babelRegister({ ...config.babelConfig, ignore: [/node_modules/] })

