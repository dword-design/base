const babelRegister = require('@babel/register')
const expect = require('expect')
const config = require('@dword-design/babel-config')

babelRegister(config)

global.expect = expect
