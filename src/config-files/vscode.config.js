import { map, stubTrue, zipObject } from '@dword-design/functions'

import editorIgnoreConfig from './editor-ignore.config'

export default {
  'files.exclude': zipObject(
    editorIgnoreConfig,
    editorIgnoreConfig |> map(stubTrue)
  ),
}
