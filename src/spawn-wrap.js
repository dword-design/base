import babelRegister from '@babel/register'
import babelConfig from '@dword-design/babel-config'
import spawnWrap from 'spawn-wrap'

babelRegister({ ...babelConfig, ignore: [/node_modules/] })

spawnWrap.runMain()
