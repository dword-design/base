import type { Base } from '@/src';

export default (base: Base) => ({
  'editor.tabSize': 2,
  'files.autoSave': 'off',
  'files.exclude': Object.fromEntries(
    base.getEditorIgnoreConfig().map(entry => [entry, true]),
  ),
  'workbench.editor.enablePreview': false,
});
