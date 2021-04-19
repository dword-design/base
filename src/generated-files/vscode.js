import { fromPairs, map } from '@dword-design/functions'

import editorIgnoreConfig from './editor-ignore'

export default {
  'editor.tabSize': 2,
  'files.exclude':
    editorIgnoreConfig |> map(config => [config, true]) |> fromPairs,
  'workbench.editor.enablePreview': false,
}
