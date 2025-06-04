import { identity, sortBy } from 'lodash-es';
import commonEditorIgnore from '@/src/get-generated-files/common-editor-ignore.js';
export default function () {
    return sortBy([...commonEditorIgnore, ...this.config.editorIgnore], identity);
}
