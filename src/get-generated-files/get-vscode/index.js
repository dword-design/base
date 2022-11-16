import { fromPairs, map } from '@dword-design/functions'

import getEditorIgnoreConfig from '@/src/get-generated-files/get-editor-ignore'

export default config => ({
  'editor.tabSize': 2,
  'files.autoSave': 'off',
  'files.exclude':
    getEditorIgnoreConfig(config) |> map(config => [config, true]) |> fromPairs,
  'workbench.editor.enablePreview': false,
})
