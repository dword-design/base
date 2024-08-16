import {
  flatten,
  map,
  mapValues,
  sortBy,
  values,
} from '@dword-design/functions';

export default {
  BFD4F2: ['blocking', 'breaking', 'important'],
  C2E0C6: ['active', 'blocked', 'maintenance', 'waiting-for'],
  EDEDED: ['released', 'semantic-release'],
}
  |> mapValues((names, color) => names |> map(name => ({ color, name })))
  |> values
  |> flatten
  |> sortBy('name');
