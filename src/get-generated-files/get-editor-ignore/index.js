import { identity, sortBy } from '@dword-design/functions';

import commonEditorIgnore from '@/src/get-generated-files/common-editor-ignore.js';

export default function () {
  return (
    [...commonEditorIgnore, ...this.config.editorIgnore] |> sortBy(identity)
  );
}
