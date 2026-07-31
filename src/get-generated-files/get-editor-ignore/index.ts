import { identity, sortBy } from 'lodash-es';

import type { Base } from '@/src';
import commonEditorIgnore from '@/src/get-generated-files/common-editor-ignore';

export default (base: Base) =>
  sortBy([...commonEditorIgnore, ...base.config.editorIgnore], identity);
