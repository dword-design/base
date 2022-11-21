import { fromPairs, map } from '@dword-design/functions'

export default function () {
  return {
    'editor.tabSize': 2,
    'files.autoSave': 'off',
    'files.exclude':
      this.getEditorIgnoreConfig() |> map(entry => [entry, true]) |> fromPairs,
    'workbench.editor.enablePreview': false,
  }
}
