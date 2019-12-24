import config from './config'
import requireHookTest from '@dword-design/require-hook-test'
import babelRegister from '@babel/register'

babelRegister({ ...config.babelConfig, ignore: [/node_modules/] })
requireHookTest()
