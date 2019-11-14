import { parseSync } from '@babel/core'
import babelConfig from '@dword-design/babel-config'

export default content => parseSync(content, babelConfig)
