import type { Base } from '@/src';

export default function (this: Base) {
  return {
    'editor.tabSize': 2,
    'files.autoSave': 'off',
    'files.exclude': Object.fromEntries(
      this.getEditorIgnoreConfig().map(entry => [entry, true]),
    ),
    'workbench.editor.enablePreview': false,
  };
}
