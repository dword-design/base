import babelRegister from '@babel/register'
import './register-require-hook'
import config from '@dword-design/base-config'

babelRegister({ ...config.babelConfig, ignore: [/node_modules/] })
