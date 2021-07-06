import '@/src/babel-register'

import expect from 'expect'
import { toMatchImageSnapshot } from 'expect-mocha-image-snapshot'
import toMatchSnapshot from 'expect-mocha-snapshot'

expect.extend({ toMatchSnapshot })
expect.extend({ toMatchImageSnapshot })
global.expect = expect
