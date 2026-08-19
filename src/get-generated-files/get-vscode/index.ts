import type { Base } from '@/src';
import getEditorIgnoreConfig from '@/src/get-generated-files/get-editor-ignore';

export default (base: Base) => ({
  'editor.tabSize': 2,
  'files.autoSave': 'off',
  'files.exclude': Object.fromEntries(
    getEditorIgnoreConfig(base).map(entry => [entry, true]),
  ),
  'workbench.editor.enablePreview': false,
});
