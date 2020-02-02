import babelRegister from '@babel/register'
import './register-require-hook'
import babelConfig from '@dword-design/babel-config'

babelRegister({ ...babelConfig, ignore: [/node_modules/] })
