import babelRegister from '@babel/register'
import './register-require-hook'
import babelConfig from '@dword-design/babel-config'
import expect from 'expect'

babelRegister({ ...babelConfig, ignore: [/node_modules/] })

global.expect = expect
