import babelRegister from '@babel/register'
import babelConfig from '@dword-design/babel-config'
import expect from 'expect'
import 'mocha-ui-exports-auto-describe'

// babel by default ignores everything outside the cwd and/or package.json folder. "ignore" resets this restriction
// https://github.com/babel/babel/issues/8321
babelRegister({ ...babelConfig, ignore: [/node_modules/] })

global.expect = expect
