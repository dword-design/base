import { map, mapValues, sortBy, values, flatten } from '@dword-design/functions'

export default {
  'C2E0C6': ['active', 'blocked', 'maintenance', 'waiting-for'],
  'BFD4F2': ['blocking', 'breaking'],
  'F9D0C4': ['important'],
  'EDEDED': ['released', 'semantic-release'],
}
  |> mapValues((names, color) => names |> map(name => ({ name, color })))
  |> values
  |> flatten
  |> sortBy('name')