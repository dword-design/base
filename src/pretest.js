import babelRegister from '@babel/register'
import expect from 'expect'
import config from '@dword-design/babel-config'

babelRegister(config)

global.expect = expect
