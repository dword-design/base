import babelRegister from '@babel/register'
import babelTestConfig from './babel-test.config'
import spawnWrap from 'spawn-wrap'

babelRegister(babelTestConfig)

spawnWrap.runMain()
