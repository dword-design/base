import matchdep from 'matchdep'
import { first } from '@dword-design/functions'
import P from 'path'

export default (matchdep.filterAll(['@dword-design/base-config-*', 'base-config-*'], P.resolve('package.json')) |> first)
  ?? '@dword-design/base-config-node'
