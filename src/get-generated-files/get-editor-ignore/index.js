import { identity, sortBy } from '@dword-design/functions'

import commonEditorIgnore from '@/src/get-generated-files/common-editor-ignore.json'

export default config => [...commonEditorIgnore, ...config.editorIgnore]
  |> sortBy(identity)
