import { identity, sortBy } from '@dword-design/functions'

import config from '@/src/config'

import commonEditorIgnore from './common-editor-ignore.json'

export default [...commonEditorIgnore, ...config.editorIgnore]
  |> sortBy(identity)
