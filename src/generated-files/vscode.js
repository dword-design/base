import { fromPairs, map } from '@dword-design/functions'

import editorIgnoreConfig from './editor-ignore'

export default {
  'files.exclude':
    editorIgnoreConfig |> map(config => [config, true]) |> fromPairs,
}
