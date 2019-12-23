import config from './depcheck.config'
import P from 'path'
import { omit } from '@dword-design/functions'

export default {
  ...config,
  ignoreDirs: [...config.ignoreDirs, 'test'],
  package: require(P.resolve('package.json')) |> omit('devDependencies'),
}
