import babelRegister from '@babel/register'
import babelConfig from '@dword-design/babel-config'
import expect from 'expect'
import 'mocha-ui-exports-auto-describe'

babelRegister({ ...babelConfig, ignore: [/node_modules/] })

global.expect = expect
